'use client';

import { useEffect, useState } from 'react';

interface Props {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: Props) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUrl(`${window.location.origin}/article/${slug}`);
  }, [slug]);

  if (!url) return null;

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const whatsapp = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encoded}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
  const xUrl = `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-6 pt-5 border-t border-navy-100">
      <div className="flex items-center flex-wrap gap-2 sm:gap-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-navy-500 mr-1">
          Share:
        </span>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#25D366] hover:bg-[#1ebe57] text-white transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.52 3.48A11.86 11.86 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.2-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.22-3.48-8.52zM12 22a9.92 9.92 0 0 1-5.07-1.4l-.36-.21-3.68.96.98-3.59-.24-.37A9.93 9.93 0 0 1 2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm5.49-7.39c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.1 1.1 0 0 0-.8.37c-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.09 4.5.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
          </svg>
          WhatsApp
        </a>
        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#1877F2] hover:bg-[#1465d2] text-white transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07C2 17.1 5.66 21.27 10.44 22v-7.02H7.9v-2.91h2.54V9.84c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22C18.34 21.27 22 17.1 22 12.07z" />
          </svg>
          Facebook
        </a>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-black hover:bg-navy-800 text-white transition"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.86l-5.37-6.97L4 22H.74l8.03-9.18L1.5 2h7.04l4.86 6.42L18.244 2z" />
          </svg>
          X
        </a>
        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy link"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-surface-100 hover:bg-navy-100 text-navy-800 border border-navy-200 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
