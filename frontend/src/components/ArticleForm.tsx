'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Article, Category, Language, Location } from '@/lib/types';
import { getToken } from './AdminAuth';
import { RichEditor } from './RichEditor';

interface Props {
  initial?: Article;
}

type LangContent = { title: string; description: string; content: string };
const EMPTY_LC: LangContent = { title: '', description: '', content: '' };
// National/International are categories, not locations — keep them out of the
// location selector even if legacy location rows still exist in the DB.
const HIDDEN_LOCATION_SLUGS = new Set(['national', 'international']);
const TABS: { key: Language; label: string; required: boolean }[] = [
  { key: 'en', label: 'English', required: true },
  { key: 'hi', label: 'हिन्दी (Hindi)', required: false },
  { key: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', required: false },
];

export function ArticleForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [activeTab, setActiveTab] = useState<Language>('en');
  const [byLang, setByLang] = useState<Record<Language, LangContent>>({
    en: {
      title: initial?.title || '',
      description: initial?.description || '',
      content: initial?.content || '',
    },
    hi: { ...EMPTY_LC },
    pa: { ...EMPTY_LC },
  });

  function patchLang(lang: Language, patch: Partial<LangContent>) {
    setByLang((prev) => ({ ...prev, [lang]: { ...prev[lang], ...patch } }));
  }

  const [author, setAuthor] = useState(initial?.author || '');
  const [postToX, setPostToX] = useState(false);
  const [postToFB, setPostToFB] = useState(false);
  const [postToIG, setPostToIG] = useState(false);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [publishedAt, setPublishedAt] = useState<string>(() => {
    const iso = initial?.published_at || initial?.created_at;
    if (!iso) return '';
    const d = new Date(iso);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initial?.categories?.map((c) => c.id) || [],
  );
  const [locationIds, setLocationIds] = useState<string[]>(
    initial?.locations?.map((l) => l.id) || [],
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.image_url || null,
  );
  const [imageUrl, setImageUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => setCategories([]));
    api
      .listLocations()
      .then((rows) =>
        setLocations(
          rows.filter((l) => !HIDDEN_LOCATION_SLUGS.has(l.slug.toLowerCase())),
        ),
      )
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    if (!isEdit || !initial) return;
    const token = getToken();
    if (!token) return;
    api
      .adminListTranslations(token, initial.id)
      .then((rows) => {
        setByLang((prev) => {
          const next = { ...prev };
          for (const t of rows) {
            if (t.language === 'hi' || t.language === 'pa') {
              next[t.language] = {
                title: t.title || '',
                description: t.description || '',
                content: t.content || '',
              };
            }
          }
          return next;
        });
      })
      .catch(() => {});
  }, [isEdit, initial]);

  function toggle(arr: string[], id: string): string[] {
    return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    setImageUrl('');
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleGalleryFiles(files: FileList | null) {
    if (!files) return;
    const max = 8;
    const incoming = Array.from(files).slice(0, max - galleryFiles.length);
    if (incoming.length === 0) return;
    setGalleryFiles((prev) => [...prev, ...incoming]);
    incoming.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () =>
        setGalleryPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  }

  function removeGalleryAt(idx: number) {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSubmitting(true);
    setError(null);

    try {
      const en = byLang.en;
      const fd = new FormData();
      fd.append('title', en.title);
      fd.append('description', en.description);
      fd.append('content', en.content);
      fd.append('author', author);
      fd.append('published', String(published));
      if (publishedAt) {
        const iso = new Date(publishedAt).toISOString();
        fd.append('published_at', iso);
      }
      categoryIds.forEach((id) => fd.append('category_ids', id));
      locationIds.forEach((id) => fd.append('location_ids', id));
      if (!isEdit) {
        if (postToX) fd.append('post_to_x', 'true');
        if (postToFB) fd.append('post_to_facebook', 'true');
        if (postToIG) fd.append('post_to_instagram', 'true');
      }

      const file = fileRef.current?.files?.[0];
      if (file) fd.append('image', file);
      else if (imageUrl.trim()) fd.append('image_url', imageUrl.trim());

      let savedId: string | undefined;
      if (isEdit && initial) {
        const upd = await api.adminUpdateArticle(token, initial.id, fd);
        savedId = upd?.id || initial.id;
      } else {
        const created = await api.adminCreateArticle(token, fd);
        savedId = created?.id;
      }

      if (savedId) {
        for (const lang of ['hi', 'pa'] as Language[]) {
          const lc = byLang[lang];
          if (lc.title.trim() && lc.content.trim()) {
            try {
              await api.adminUpsertTranslation(token, savedId, {
                language: lang,
                title: lc.title.trim(),
                description: lc.description,
                content: lc.content,
              });
            } catch (e: any) {
              setError(`Saved, but ${lang.toUpperCase()} translation failed: ${e?.message || e}`);
            }
          }
        }
      }

      if (galleryFiles.length > 0 && savedId) {
        try {
          await api.adminAddImages(token, savedId, galleryFiles);
        } catch (e: any) {
          setError(`Article saved but gallery upload failed: ${e?.message || e}`);
        }
      }

      router.push('/admin/articles');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card overflow-hidden">
        <div className="flex border-b border-ink-300/40 bg-surface-50 overflow-x-auto">
          {TABS.map((t) => {
            const lc = byLang[t.key];
            const filled = lc.title.trim() && lc.content.trim();
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`whitespace-nowrap px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
                  active
                    ? 'border-brand-500 text-brand-500 bg-white'
                    : 'border-transparent text-ink-700 hover:text-brand-500'
                }`}
              >
                <span>{t.label}</span>
                {t.required && <span className="text-[10px] text-brand-500">*</span>}
                {!t.required && filled && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    Added
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-3 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Title{activeTab === 'en' && <span className="text-brand-500"> *</span>}
            </label>
            <input
              required={activeTab === 'en'}
              value={byLang[activeTab].title}
              onChange={(e) => patchLang(activeTab, { title: e.target.value })}
              dir={activeTab === 'pa' || activeTab === 'hi' ? 'auto' : 'ltr'}
              className="w-full border border-ink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={
                activeTab === 'hi'
                  ? 'समाचार का शीर्षक'
                  : activeTab === 'pa'
                    ? 'ਖਬਰ ਦਾ ਸਿਰਲੇਖ'
                    : 'Headline'
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={byLang[activeTab].description}
              onChange={(e) => patchLang(activeTab, { description: e.target.value })}
              dir="auto"
              className="w-full border border-ink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Content{activeTab === 'en' && <span className="text-brand-500"> *</span>}
            </label>
            <RichEditor
              key={activeTab}
              value={byLang[activeTab].content}
              onChange={(html) => patchLang(activeTab, { content: html })}
              dir="auto"
              placeholder={
                activeTab === 'en'
                  ? 'Write the full article. Use the toolbar for formatting.'
                  : activeTab === 'hi'
                    ? 'पूरा समाचार यहाँ लिखें।'
                    : 'ਪੂਰਾ ਲੇਖ ਇੱਥੇ ਲਿਖੋ।'
              }
            />
            {activeTab !== 'en' && (
              <p className="text-[11px] text-ink-500 mt-2">
                Optional. Filled translations are saved on submit. Leave empty to skip.
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-ink-300/40">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Author
              </label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full border border-ink-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Publish Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full border border-ink-300 rounded px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-ink-500 mt-1">
                Used for display order and on the article page. Leave as-is to use the current time; set a back-date to surface a story under a specific timestamp.
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Publish immediately</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {!isEdit && (
        <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-3 sm:p-6">
          <h3 className="font-bold text-ink-900 text-sm mb-1">
            Auto-Post to Social
          </h3>
          <p className="text-xs text-ink-500 mb-4">
            Selected platforms get a post when this article is published. Requires platform credentials in backend env.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <SocialToggle
              checked={postToX}
              onChange={setPostToX}
              label="Post to X (Twitter)"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.86l-5.37-6.97L4 22H.74l8.03-9.18L1.5 2h7.04l4.86 6.42L18.244 2z" />
                </svg>
              }
            />
            <SocialToggle
              checked={postToFB}
              onChange={setPostToFB}
              label="Post to Facebook"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07C2 17.1 5.66 21.27 10.44 22v-7.02H7.9v-2.91h2.54V9.84c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22C18.34 21.27 22 17.1 22 12.07z" />
                </svg>
              }
            />
            <SocialToggle
              checked={postToIG}
              onChange={setPostToIG}
              label="Post to Instagram"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.6-10.9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                </svg>
              }
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-3 sm:p-6">
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Hero Image
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file && fileRef.current) {
              const dt = new DataTransfer();
              dt.items.add(file);
              fileRef.current.files = dt.files;
              handleFile(file);
            }
          }}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            dragOver
              ? 'border-brand-500 bg-brand-50'
              : 'border-ink-300 hover:bg-surface-50'
          }`}
          onClick={() => fileRef.current?.click()}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              className="mx-auto max-h-60 rounded"
            />
          ) : (
            <div className="text-sm text-ink-500">
              Click or drag and drop an image here
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div className="mt-3">
          <label className="block text-xs font-medium text-ink-500 mb-1">
            Or paste an image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            placeholder="https://example.com/photo.jpg"
            onChange={(e) => {
              const v = e.target.value;
              setImageUrl(v);
              if (fileRef.current) fileRef.current.value = '';
              setImagePreview(v.trim() || initial?.image_url || null);
            }}
            className="w-full border border-ink-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-[11px] text-ink-500 mt-1">
            Used when no file is uploaded. Uploading a file overrides this.
          </p>
        </div>
      </div>

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-3 sm:p-6 grid gap-4 sm:gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = categoryIds.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategoryIds((arr) => toggle(arr, c.id))}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    active
                      ? 'bg-brand-700 text-white'
                      : 'bg-surface-100 text-ink-700 hover:bg-brand-50'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
            {categories.length === 0 && (
              <p className="text-xs text-ink-500">
                No categories. Seeded on backend boot.
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Locations
          </label>
          <div className="flex flex-wrap gap-2">
            {locations.map((l) => {
              const active = locationIds.includes(l.id);
              return (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setLocationIds((arr) => toggle(arr, l.id))}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    active
                      ? 'bg-accent-500 text-white'
                      : 'bg-surface-100 text-ink-700 hover:bg-accent-500/10'
                  }`}
                >
                  {l.name}
                </button>
              );
            })}
            {locations.length === 0 && (
              <p className="text-xs text-ink-500">No locations.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-3 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-ink-700">
            Gallery Images (Optional)
          </label>
          <span className="text-xs text-ink-500">
            {galleryFiles.length}/8 selected
          </span>
        </div>
        <p className="text-xs text-ink-500 mb-3">
          Add up to 8 additional photos. Shown alongside the hero image on the article page.
        </p>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {galleryPreviews.map((src, i) => (
            <div
              key={i}
              className="relative border border-ink-300/40 rounded-lg overflow-hidden bg-surface-50 aspect-[4/3]"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeGalleryAt(i)}
                className="absolute top-1 right-1 bg-black/55 hover:bg-accent-600 text-white text-[10px] px-2 py-0.5 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          {galleryFiles.length < 8 && (
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="aspect-[4/3] border-2 border-dashed border-ink-300 hover:border-brand-500 hover:bg-brand-50 rounded-lg grid place-items-center text-sm text-ink-500 hover:text-brand-700 transition"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl leading-none">+</span>
                <span>Add Images</span>
              </div>
            </button>
          )}
        </div>
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleGalleryFiles(e.target.files);
            if (galleryRef.current) galleryRef.current.value = '';
          }}
        />
        {isEdit && (
          <p className="text-[11px] text-ink-500 mt-3">
            Note: existing gallery images are managed below.
          </p>
        )}
      </div>

      {error && (
        <div className="bg-white border border-accent-500/40 rounded p-3 text-sm text-accent-600">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={submitting}
          className="bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded"
        >
          {submitting
            ? 'Saving...'
            : isEdit
              ? 'Save Changes'
              : 'Publish Article'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-ink-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SocialToggle({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      className={`flex items-center gap-2 px-3 py-2.5 rounded-md border cursor-pointer transition ${
        checked
          ? 'border-brand-500 bg-brand-50 text-brand-600'
          : 'border-ink-300 text-ink-700 hover:bg-surface-50'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4"
      />
      <span className={checked ? 'text-brand-600' : 'text-ink-500'}>{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </label>
  );
}
