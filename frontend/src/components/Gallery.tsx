'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ArticleImage } from '@/lib/types';

interface Props {
  images: ArticleImage[];
  title: string;
}

export function Gallery({ images, title }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const show = useCallback(
    (delta: number) =>
      setOpen((cur) =>
        cur === null ? cur : (cur + delta + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(1);
      if (e.key === 'ArrowLeft') show(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, show]);

  if (images.length === 0) return null;
  const active = open === null ? null : images[open];

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-navy-900 mb-4 dark:text-white">
        Photo Gallery
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpen(i)}
            className="block relative overflow-hidden rounded-lg border border-navy-100 hover:shadow-card transition h-44 bg-surface-100 dark:bg-navy-700 cursor-zoom-in"
          >
            <Image
              src={img.url}
              alt={img.alt || title}
              fill
              loading="lazy"
              sizes="(min-width: 768px) 30vw, 50vw"
              className="object-cover"
            />
            {img.alt && (
              <span className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-xs px-2 py-1 text-left">
                {img.alt}
              </span>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none"
          >
            &times;
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  show(-1);
                }}
                aria-label="Previous"
                className="absolute left-3 sm:left-6 text-white/80 hover:text-white text-4xl leading-none px-2"
              >
                &#8249;
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  show(1);
                }}
                aria-label="Next"
                className="absolute right-3 sm:right-6 text-white/80 hover:text-white text-4xl leading-none px-2"
              >
                &#8250;
              </button>
            </>
          )}
          <figure
            className="max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[70vh]">
              <Image
                src={active.url}
                alt={active.alt || title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            {active.alt && (
              <figcaption className="text-center text-sm text-white/80 mt-3">
                {active.alt}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}
