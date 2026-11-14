'use client';

// ==============================================================================
// SCHEMATRIX - Document Vault
// Lists document categories, lets the user add metadata + upload a file, and
// shows uploaded names/status. Document metadata is stored on the server
// (MongoDB, authenticated); file bytes are not stored unless an object store
// is configured, and that is surfaced honestly to the user.
// ==============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { UserDocument } from '@/lib/types';
import {
  DOCUMENT_CATEGORIES,
  listDocuments,
  uploadDocument,
  addMetadataDocument,
  deleteDocument,
  getDocumentDownloadUrl,
  validateVaultFile,
  isVaultRemoteEnabled,
  formatFileSize,
} from '@/lib/vault';
import {
  FolderLock,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  ShieldCheck,
  HardDrive,
  Trash2,
  CheckCircle2,
  Plus,
  Download,
  X,
} from 'lucide-react';

export function DocumentVault(): React.ReactElement {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remoteEnabled = isVaultRemoteEnabled();

  const loadDocs = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      return;
    }
    setLoading(true);
    try {
      const docs = await listDocuments(user.id);
      setDocuments(docs);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const resetForm = () => {
    setTitle('');
    setCategory(DOCUMENT_CATEGORIES[0]);
    setNotes('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(t('vaultSignInRequired'));
      return;
    }
    if (!title.trim()) {
      setError(t('vaultTitleRequired'));
      return;
    }

    setUploading(true);
    setError(null);
    setNotice(null);

    try {
      if (file) {
        const validation = validateVaultFile(file);
        if (!validation.valid) {
          setError(validation.error || t('vaultUploadFailed'));
          return;
        }
        const res = await uploadDocument(user.id, file, {
          title: title.trim(),
          category,
          notes: notes.trim() || undefined,
        });
        if (!res.success) {
          setError(res.error || t('vaultUploadFailed'));
        } else {
          if (res.storage === 'demo') {
            setNotice(res.error || t('vaultDemoSaved'));
          } else {
            setNotice(t('vaultRemoteSaved'));
          }
        }
      } else {
        // Metadata-only entry (stored on the server)
        const metaRes = await addMetadataDocument({
          title: title.trim(),
          category,
          notes: notes.trim() || undefined,
        });
        if (!metaRes.success) {
          setError(metaRes.error || t('vaultUploadFailed'));
          return;
        }
        setNotice(t('vaultMetadataSaved'));
      }
      resetForm();
      await loadDocs();
    } catch (err: any) {
      setError(err?.message || t('vaultUploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: UserDocument) => {
    if (!user) return;
    setError(null);
    const res = await deleteDocument(user.id, doc);
    if (!res.success) {
      setError(res.error || t('vaultUploadFailed'));
      return;
    }
    await loadDocs();
  };

  const handleDownload = async (doc: UserDocument) => {
    setError(null);
    const res = await getDocumentDownloadUrl(doc);
    if (!res.success || !res.url) {
      setError(res.error || t('vaultDownloadFailed'));
      return;
    }
    const link = document.createElement('a');
    link.href = res.url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f && !title.trim()) {
      setTitle(f.name.replace(/\.[^.]+$/, ''));
    }
  };

  return (
    <section
      id="vault"
      className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
            <FolderLock className="w-4 h-4" />
            <span>{t('vault')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Document Vault
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Keep your certificates, IDs, and records organized for scheme applications.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-end">
          {remoteEnabled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('vaultSecureBadge')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <HardDrive className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('vaultDemoBadge')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Mode banner */}
      {!remoteEnabled && (
        <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {t('vaultDemoBanner')}
          </p>
        </div>
      )}

      {!user ? (
        <div className="py-12 text-center rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3">
          <FolderLock className="w-10 h-10 text-neutral-400 mx-auto" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            {t('vaultSignInRequired')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-neutral-50/80 dark:bg-neutral-900/60 border-2 border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4 h-fit"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-neutral-900 dark:text-white">{t('vaultAddDocument')}</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t('vaultTitle')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('vaultTitlePlaceholder')}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t('category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t('vaultFile')}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm text-neutral-600 dark:text-neutral-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-neutral-950 hover:file:bg-amber-400"
              />
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {t('vaultFileHint')}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t('vaultNotes')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={t('vaultNotesPlaceholder')}
                className="w-full resize-none px-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {notice && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{uploading ? t('vaultUploading') : t('vaultSave')}</span>
            </button>
          </form>

          {/* Document list */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                {t('vaultMyDocuments')}
              </h3>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {documents.length} {t('vaultItems')}
              </span>
            </div>

            {loading ? (
              <div className="py-16 flex items-center justify-center text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : documents.length === 0 ? (
              <div className="py-16 text-center rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2">
                <FolderLock className="w-10 h-10 text-neutral-400 mx-auto" />
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  {t('vaultEmpty')}
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {doc.category} · {doc.fileName}
                        {doc.fileSize > 0 ? ` · ${formatFileSize(doc.fileSize)}` : ''}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {doc.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      aria-label={t('vaultDownload')}
                      className="shrink-0 p-2 rounded-xl text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc)}
                      aria-label={t('vaultDelete')}
                      className="shrink-0 p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 outline-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}