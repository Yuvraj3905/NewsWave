'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Ad, AdSlot as Slot } from '@/lib/types';

// Renders the highest-priority active ad for a slot. Renders nothing when the
// slot is empty, so it's safe to drop anywhere in the layout.
export function AdSlot({ slot, className }: { slot: Slot; className?: string }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listAds(slot)
      .then((ads) => {
        if (!cancelled) setAd(ads[0] || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slot]);

  if (!ad) return null;

  const label = (
    <span className="block text-[10px] uppercase tracking-widest text-ink-400 mb-1">
      Advertisement
    </span>
  );

  if (ad.type === 'html' && ad.html) {
    return (
      <div className={className}>
        {label}
        {/* Admin-entered ad-network snippet (trusted). */}
        <div dangerouslySetInnerHTML={{ __html: ad.html }} />
      </div>
    );
  }

  if (!ad.image_url) return null;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ad.image_url}
      alt={ad.name}
      className="w-full h-auto rounded"
      loading="lazy"
    />
  );

  return (
    <div className={className}>
      {label}
      {ad.target_url ? (
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
        >
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}
