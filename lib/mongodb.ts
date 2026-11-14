// ==============================================================================
// SCHEMATRIX - MongoDB Atlas Connection (server-only)
//
// Singleton MongoClient with development hot-reload protection. This module MUST
// only ever be imported from server code (API routes, server components). It is
// never imported into a client component and never exposes credentials.
// ==============================================================================

import { MongoClient, Db } from 'mongodb';
import dns from 'node:dns';

export const DB_NAME = 'schematrix';

// Some environments (e.g. certain sandboxes/VPNs) point Node's DNS at a local
// resolver (127.0.0.1) that refuses SRV queries, even though the OS resolver
// works. When using mongodb+srv://, fall back to public DNS servers so the
// driver's SRV lookup succeeds. Guarded so it never throws.
let dnsPatched = false;
function ensureSrvDns(): void {
  if (dnsPatched) return;
  dnsPatched = true;
  try {
    const servers = dns.getServers();
    const onlyLocal = servers.length > 0 && servers.every((s) => s === '127.0.0.1' || s === '::1');
    if (onlyLocal) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
  } catch {
    /* ignore — the driver will surface a clear error if DNS truly fails */
  }
}

// Re-exported here for convenience so server code can import both the client and
// collection names from a single module. The canonical definition lives in
// lib/collections.ts (which imports this module).
export { COLLECTIONS } from './collections';

interface MongoGlobal {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
  db: Db | null;
}

// Attach to globalThis so Next.js hot-reload in dev does not open a new pool
// on every module reload (a common cause of leaked connections).
const globalForMongo = globalThis as unknown as { _schematrixMongo?: MongoGlobal };

const cached: MongoGlobal =
  globalForMongo._schematrixMongo ?? { client: null, promise: null, db: null };

if (process.env.NODE_ENV !== 'production') {
  globalForMongo._schematrixMongo = cached;
}

/**
 * The raw MongoDB connection URI (server-side only).
 * Returns null when MONGODB_URI is missing or clearly a placeholder.
 */
export function getMongoUri(): string | null {
  let uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  // Defensively strip surrounding quotes. Some editors/dotenv setups leave a
  // leading quote (or unbalanced quotes) in the raw value; strip each end
  // independently so the driver receives a clean connection string.
  uri = uri.replace(/^["']+/, '').replace(/["']+$/, '').trim();
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return null;
  }
  if (uri.includes('your-connection-string') || uri.includes('<db_password>')) {
    return null;
  }
  return uri;
}

/** True when a usable MongoDB connection string is configured. */
export const isMongoConfigured: boolean = Boolean(getMongoUri());

/**
 * Resolve SRV records via DNS-over-HTTPS (Cloudflare/Google). This bypasses
 * Node's DNS resolver entirely, so it works even where the local resolver or the
 * bundler's `dns` shim refuses SRV queries. Returns [{name, port}] or null.
 */
async function resolveSrvViaDoH(
  hostname: string
): Promise<Array<{ name: string; port: number }> | null> {
  const endpoints = [
    (type: string) =>
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
        `_mongodb._tcp.${hostname}`
      )}&type=${type}`,
    (type: string) =>
      `https://dns.google/resolve?name=${encodeURIComponent(
        `_mongodb._tcp.${hostname}`
      )}&type=${type}`,
  ];

  for (const make of endpoints) {
    try {
      const res = await fetch(make('SRV'), {
        headers: { Accept: 'application/dns-json' },
      });
      if (!res.ok) continue;
      const data: any = await res.json();
      const answers: any[] = Array.isArray(data.Answer) ? data.Answer : [];
      const srv = answers
        .filter((a) => a.type === 33 && typeof a.data === 'string')
        .map((a) => {
          // data format: "priority weight port target"
          const parts = String(a.data).trim().split(/\s+/);
          return { port: Number(parts[2]), name: parts[3].replace(/\.$/, '') };
        })
        .filter((r) => r.name && Number.isFinite(r.port));
      if (srv.length) return srv;
    } catch {
      /* try next endpoint */
    }
  }
  return null;
}

/** Resolve TXT (authSource/replicaSet) via DNS-over-HTTPS. */
async function resolveTxtViaDoH(hostname: string): Promise<string | null> {
  const endpoints = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=TXT`,
    `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=TXT`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
      if (!res.ok) continue;
      const data: any = await res.json();
      const answers: any[] = Array.isArray(data.Answer) ? data.Answer : [];
      const txt = answers
        .filter((a) => a.type === 16 && typeof a.data === 'string')
        .map((a) => String(a.data).replace(/^"|"$/g, ''))
        .join('');
      if (txt) return txt;
    } catch {
      /* try next endpoint */
    }
  }
  return null;
}

/**
 * Manually resolve mongodb+srv to a direct mongodb:// URI.
 *
 * Uses DNS-over-HTTPS so it works even where the local resolver or bundler's
 * `dns` shim refuses SRV/TXT queries. Returns null if resolution is not possible.
 */
async function resolveSrvToDirectUri(srvUri: string): Promise<string | null> {
  try {
    const parsed = new URL(srvUri);
    const host = parsed.hostname;

    let srv = await resolveSrvViaDoH(host);
    if (!srv) {
      // Fallback to the node resolver (works in plain Node deployments).
      try {
        ensureSrvDns();
        srv = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
      } catch {
        srv = null;
      }
    }
    if (!srv || !srv.length) return null;

    const hosts = srv.map((r) => `${r.name}:${r.port}`);

    const params = new URLSearchParams(parsed.search);
    let txt = await resolveTxtViaDoH(host);
    if (!txt) {
      try {
        const t = await dns.promises.resolveTxt(host);
        if (t.length && t[0] && t[0][0]) txt = t[0].join('');
      } catch {
        /* optional */
      }
    }
    if (txt) {
      const authSource = txt.match(/authSource=([^&]+)/);
      const replicaSet = txt.match(/replicaSet=([^&]+)/);
      if (authSource) params.set('authSource', authSource[1]);
      if (replicaSet) params.set('replicaSet', replicaSet[1]);
    }

    const user = parsed.username;
    const pass = parsed.password;
    const dbPath = parsed.pathname || '/';
    const qs = params.toString();
    return `mongodb://${user}:${pass}@${hosts.join(',')}/${dbPath}${qs ? `?${qs}` : ''}`;
  } catch (err: any) {
    console.error('[mongo] manual SRV resolution failed:', err?.code || err?.message);
    return null;
  }
}

/**
 * Returns a connected MongoClient (cached/singleton). Throws a descriptive error
 * if MONGODB_URI is missing so callers can surface an honest "not configured"
 * state rather than a silent failure.
 */
export async function getMongoClient(): Promise<MongoClient> {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not configured. Add a MongoDB Atlas connection string to run the database.'
    );
  }

  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = (async () => {
      // Fast path: let the driver handle mongodb+srv itself.
      if (uri.startsWith('mongodb+srv://')) {
        ensureSrvDns();
        try {
          const client = await new MongoClient(uri, options).connect();
          cached.client = client;
          return client;
        } catch (srvErr: any) {
          // SRV failed (e.g. DNS resolver refuses SRV). Try manual resolution.
          const direct = await resolveSrvToDirectUri(uri);
          if (!direct) throw srvErr;
          const client = await new MongoClient(direct, {
            ...options,
            tls: true,
          }).connect();
          cached.client = client;
          return client;
        }
      }

      const client = await new MongoClient(uri, options).connect();
      cached.client = client;
      return client;
    })().catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  return cached.promise;
}

/**
 * Returns the `schematrix` database handle. Cached on the client for reuse.
 */
export async function getDb(): Promise<Db> {
  if (cached.db) {
    return cached.db;
  }
  const client = await getMongoClient();
  cached.db = client.db(DB_NAME);
  return cached.db;
}

/**
 * Health check used by /api/health. Returns a structured status and never
 * throws.
 */
export async function checkMongoHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  dnsServers?: string[];
  error?: string;
}> {
  const uri = getMongoUri();
  if (!uri) {
    return { configured: false, connected: false };
  }
  try {
    ensureSrvDns();
    const dnsServers = dns.getServers();
    const client = await getMongoClient();
    await client.db().command({ ping: 1 });
    return { configured: true, connected: true, dnsServers };
  } catch (e: any) {
    return {
      configured: true,
      connected: false,
      dnsServers: (() => {
        try {
          return dns.getServers();
        } catch {
          return undefined;
        }
      })(),
      error: e?.message || 'Connection failed.',
    };
  }
}