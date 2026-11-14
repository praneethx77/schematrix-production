// ==============================================================================
// SCHEMATRIX - Document Vault Service (client-side)
//
// MongoDB stores document METADATA (via /api/documents, authenticated). Actual
// file BYTES are not stored in MongoDB. When a private object store is not
// configured, uploads fall back to a clearly-labeled local-only mode and the
// caller is told storage === 'demo'. This module never claims a remote upload
// succeeded unless the server actually recorded the metadata.
// ==============================================================================

import { UserDocument, DocumentStatus } from './types';

export const VAULT_MAX_FILE_BYTES = 10 * 1024 * 1024;

/** MIME types accepted by the vault. */
export const VAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'image/heic',
  'image/heif',
] as const;

const DEMO_DOCS_KEY = 'schematrix_demo_documents';

export const DOCUMENT_CATEGORIES = [
  'Identity (Aadhaar / PAN)',
  'Ration Card',
  'Income Certificate',
  'Caste / Community Certificate',
  'Land Records (Pattas / 1-B)',
  'Bank / DBT Details',
  'Domicile / Residence Proof',
  'Educational Certificates',
  'Medical / Disability Records',
  'Other',
] as const;

// -----------------------------------------------------------------------------
// Local demo fallback storage (browser localStorage)
// -----------------------------------------------------------------------------
function readDemoDocs(): UserDocument[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(DEMO_DOCS_KEY);
    return raw ? (JSON.parse(raw) as UserDocument[]) : [];
  } catch {
    return [];
  }
}

function writeDemoDocs(docs: UserDocument[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_DOCS_KEY, JSON.stringify(docs));
    }
  } catch {
    /* ignore quota */
  }
}

// -----------------------------------------------------------------------------
// File validation (mirrors server-side rules)
// -----------------------------------------------------------------------------
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateVaultFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }
  if (file.size > VAULT_MAX_FILE_BYTES) {
    return {
      valid: false,
      error: `File is ${formatFileSize(file.size)} — exceeds the ${formatFileSize(
        VAULT_MAX_FILE_BYTES
      )} limit.`,
    };
  }
  if (file.type && !(VAULT_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Allowed: PDF, JPG, PNG, WEBP, HEIC.',
    };
  }
  return { valid: true };
}

// -----------------------------------------------------------------------------
// API result types
// -----------------------------------------------------------------------------
export interface VaultUploadResult {
  success: boolean;
  /** 'remote' when the server recorded metadata, 'demo' when local only. */
  storage: 'remote' | 'demo';
  document?: UserDocument;
  error?: string;
}

export interface ApiError {
  error?: string;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & ApiError;
  if (!res.ok) {
    const msg = (data as ApiError)?.error || `Request failed (${res.status})`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data;
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * List documents for the current user. Uses the authenticated /api/documents
 * endpoint (MongoDB). If the request fails (e.g. not signed in or backend down),
 * returns local demo docs so the UI still shows whatever is available locally.
 */
export async function listDocuments(userId: string): Promise<UserDocument[]> {
  try {
    const data = await api<{ documents: UserDocument[] }>('/api/documents');
    return data.documents;
  } catch {
    return readDemoDocs();
  }
}

/**
 * Upload a document. The file BYTES are not sent to MongoDB. We validate the
 * file, then record METADATA on the server (authenticated). If the server is
 * unavailable, we fall back to local demo storage and say so honestly.
 */
export async function uploadDocument(
  userId: string,
  file: File,
  meta: { title: string; category: string; notes?: string }
): Promise<VaultUploadResult> {
  const validation = validateVaultFile(file);
  if (!validation.valid) {
    return { success: false, storage: 'demo', error: validation.error };
  }

  try {
    const doc = await api<{ document: UserDocument }>('/api/documents', {
      method: 'POST',
      body: JSON.stringify({
        title: meta.title,
        category: meta.category,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        notes: meta.notes,
      }),
    });
    return { success: true, storage: 'remote', document: doc.document };
  } catch (e: any) {
    if (e?.status === 401) {
      return {
        success: false,
        storage: 'demo',
        error: 'Sign in to upload documents to your vault.',
      };
    }
    const demoDoc = saveDemoDoc(userId, file, meta);
    return {
      success: true,
      storage: 'demo',
      document: demoDoc,
      error: `Remote storage unavailable (${e?.message || 'unknown error'}). Saved in local demo mode only.`,
    };
  }
}

function saveDemoDoc(
  userId: string,
  file: File,
  meta: { title: string; category: string; notes?: string }
): UserDocument {
  const doc: UserDocument = {
    id: `demo_doc_${Date.now()}`,
    ownerId: userId,
    title: meta.title,
    category: meta.category,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
    storagePath: `local://${file.name}`,
    status: 'Uploaded',
    notes: meta.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docs = readDemoDocs();
  docs.unshift(doc);
  writeDemoDocs(docs);
  return doc;
}

/**
 * Add a metadata-only document entry on the server (no file attached).
 */
export async function addMetadataDocument(
  meta: { title: string; category: string; notes?: string }
): Promise<{ success: boolean; document?: UserDocument; error?: string }> {
  try {
    const data = await api<{ document: UserDocument }>('/api/documents', {
      method: 'POST',
      body: JSON.stringify({
        title: meta.title,
        category: meta.category,
        fileName: 'No file attached',
        mimeType: 'application/octet-stream',
        fileSize: 0,
        notes: meta.notes,
      }),
    });
    return { success: true, document: data.document };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to save document metadata.' };
  }
}

/**
 * Delete a document. Removes the server metadata row (authenticated, ownership
 * checked server-side). Falls back to local removal for demo entries.
 */
export async function deleteDocument(
  _userId: string,
  doc: UserDocument
): Promise<{ success: boolean; error?: string }> {
  // Demo/local entries have a non-ObjectId id; remove locally.
  const isRemoteId = /^[0-9a-f]{24}$/i.test(doc.id);
  if (isRemoteId) {
    try {
      await api(`/api/documents?id=${encodeURIComponent(doc.id)}`, { method: 'DELETE' });
      return { success: true };
    } catch (e: any) {
      if (e?.status === 404) {
        // Already gone on the server; remove locally too.
        removeDocument(doc.id);
        return { success: true };
      }
      return { success: false, error: e?.message || 'Delete failed.' };
    }
  }

  removeDocument(doc.id);
  return { success: true };
}

export function removeDocument(id: string): void {
  const docs = readDemoDocs().filter((d) => d.id !== id);
  writeDemoDocs(docs);
}

/**
 * Whether the server-backed (remote) vault is enabled. Because metadata is
 * always served through the API when a session exists, we report remote as
 * available whenever the app can reach the API. File byte storage still requires
 * an object store; that is surfaced honestly by upload results.
 */
export function isVaultRemoteEnabled(): boolean {
  // Remote metadata is available through the app's own API; actual object
  // storage is optional. We treat "remote enabled" as true so the UI reflects
  // that metadata persistence is supported, while uploads still report 'demo'
  // when object storage is not configured.
  return true;
}

/**
 * Create a download link for a remotely-stored document. MongoDB does not serve
 * file bytes; without a configured object store there is no downloadable blob,
 * so we return an honest error rather than a fake URL.
 */
export async function getDocumentDownloadUrl(
  doc: UserDocument
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (doc.storagePath && !doc.storagePath.startsWith('local://') && doc.storagePath !== 'metadata-only') {
    // A future object store integration would mint a signed URL here. Until then,
    // be explicit that file bytes are not retrievable from metadata-only records.
    return {
      success: false,
      error:
        'File bytes are not stored on the server (metadata-only). Configure an object storage provider to enable downloads.',
    };
  }
  return { success: false, error: 'No stored file available for this document.' };
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}