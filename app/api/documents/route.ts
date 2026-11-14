// ==============================================================================
// SCHEMATRIX - /api/documents (GET list, POST create metadata, DELETE)
// Document metadata is stored in MongoDB. Actual file bytes are NOT stored in
// MongoDB; uploads rely on a configured private object store, otherwise the
// client keeps a clearly-labeled local-only fallback. All operations require an
// authenticated session and enforce per-user ownership.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { getSessionUser } from '@/lib/auth-server';
import { jsonError, withErrorHandling } from '@/lib/api';
import { documentMetaSchema } from '@/lib/validation';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

interface DocumentDoc {
  _id: ObjectId;
  id: string;
  owner_id: string;
  title: string;
  category: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

function mapDoc(row: DocumentDoc) {
  return {
    id: row.id ?? String(row._id),
    ownerId: row.owner_id,
    title: row.title,
    category: row.category,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    storagePath: row.storage_path,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listHandler(): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return jsonError('Sign in to view your documents.', 401, 'auth_required');
  }

  const db = await getDb();
  const rows = await db
    .collection<DocumentDoc>(COLLECTIONS.documents)
    .find({ owner_id: user.id })
    .sort({ created_at: -1 })
    .toArray();

  return NextResponse.json({ documents: rows.map(mapDoc) });
}

async function createHandler(req: NextRequest): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return jsonError('Sign in to add documents.', 401, 'auth_required');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid request body.', 400);
  }

  const parsed = documentMetaSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid document.', 400, 'validation');
  }

  const d = parsed.data;
  const now = new Date().toISOString();

  const db = await getDb();
  const result = await db.collection<DocumentDoc>(COLLECTIONS.documents).insertOne({
    id: '',
    owner_id: user.id,
    title: d.title,
    category: d.category,
    file_name: d.fileName,
    mime_type: d.mimeType,
    file_size: d.fileSize,
    // Metadata-only: no file bytes are stored in MongoDB. Callers that have an
    // object store set storage_path accordingly; otherwise 'metadata-only'.
    storage_path: 'metadata-only',
    status: 'Uploaded',
    notes: d.notes || null,
    created_at: now,
    updated_at: now,
  } as DocumentDoc);

  const docId = result.insertedId.toHexString();
  await db
    .collection<DocumentDoc>(COLLECTIONS.documents)
    .updateOne({ _id: result.insertedId }, { $set: { id: docId } });

  return NextResponse.json(
    { document: mapDoc({ ...(await db.collection<DocumentDoc>(COLLECTIONS.documents).findOne({ _id: result.insertedId })) as DocumentDoc }) },
    { status: 201 }
  );
}

async function deleteHandler(req: NextRequest): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return jsonError('Sign in to delete documents.', 401, 'auth_required');
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return jsonError('Document id is required.', 400, 'validation');
  }

  const db = await getDb();
  // Ownership enforced by matching both id and owner_id.
  const result = await db
    .collection<DocumentDoc>(COLLECTIONS.documents)
    .deleteOne({ id, owner_id: user.id });

  if (result.deletedCount === 0) {
    return jsonError('Document not found or you do not own it.', 404, 'not_found');
  }

  return NextResponse.json({ success: true });
}

export const GET = withErrorHandling(listHandler);
export const POST = withErrorHandling(createHandler);
export const DELETE = withErrorHandling(deleteHandler);