'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { ArticleImage } from '@/lib/types';
import { getToken } from './AdminAuth';

interface Props {
  articleId: string;
}

export function ImagesManager({ articleId }: Props) {
  const [items, setItems] = useState<ArticleImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    api
      .listArticleImages(articleId)
      .then((rows) =>
        setItems(rows.slice().sort((a, b) => a.position - b.position)),
      )
      .catch((e) => setError(e?.message || 'Failed to load images'));
  };

  useEffect(() => {
    refresh();
  }, [articleId]);

  const upload = async () => {
    const token = getToken();
    const files = fileRef.current?.files;
    if (!token || !files?.length) return;
    setBusy(true);
    setError(null);
    try {
      await api.adminAddImages(token, articleId, Array.from(files));
      if (fileRef.current) fileRef.current.value = '';
      refresh();
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const addUrl = async () => {
    const token = getToken();
    if (!token || !urlInput.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.adminAddImageByUrl(
        token,
        articleId,
        urlInput.trim(),
        altInput.trim() || undefined,
      );
      setUrlInput('');
      setAltInput('');
      refresh();
    } catch (e: any) {
      setError(e?.message || 'Add failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (imageId: string) => {
    const token = getToken();
    if (!token) return;
    if (!confirm('Delete this image?')) return;
    try {
      await api.adminDeleteImage(token, articleId, imageId);
      refresh();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  return (
    <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-6">
      <h2 className="text-lg font-bold text-brand-900 mb-1">Photo Gallery</h2>
      <p className="text-xs text-ink-500 mb-4">
        Add multiple images shown alongside the main hero image on the article page.
      </p>

      {error && (
        <div className="bg-accent-500/10 border border-accent-500/40 rounded p-2 text-sm text-accent-600 mb-3">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mb-5">
        <div className="border border-ink-300 rounded-lg p-3">
          <label className="block text-xs font-semibold text-ink-700 mb-2">
            Upload files (up to 10)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="block text-sm w-full"
          />
          <button
            type="button"
            onClick={upload}
            disabled={busy}
            className="mt-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold px-3 py-1.5 rounded"
          >
            {busy ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        <div className="border border-ink-300 rounded-lg p-3">
          <label className="block text-xs font-semibold text-ink-700 mb-2">
            Add by URL
          </label>
          <input
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full border border-ink-300 rounded px-2 py-1.5 text-sm mb-2"
          />
          <input
            placeholder="Alt text (optional)"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            className="w-full border border-ink-300 rounded px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={busy || !urlInput.trim()}
            className="mt-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold px-3 py-1.5 rounded"
          >
            Add image
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-500">No additional images yet.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {items.map((img) => (
            <div
              key={img.id}
              className="relative border border-ink-300/40 rounded-lg overflow-hidden bg-surface-50"
            >
              <img
                src={img.url}
                alt={img.alt || ''}
                className="w-full h-28 object-cover"
              />
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="absolute top-1 right-1 bg-black/55 hover:bg-accent-600 text-white text-[10px] px-2 py-0.5 rounded"
              >
                Delete
              </button>
              {img.alt && (
                <div className="px-2 py-1 text-[11px] text-ink-700 truncate">
                  {img.alt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
