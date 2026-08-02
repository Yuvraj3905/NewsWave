import { buildDownloadUrl } from '@/lib/watermark';

// Separate from the on-page corner badge: gives a big-centered-watermark copy
// meant to be shared/reused, so the source stays credited if it spreads elsewhere.
export function DownloadImageButton({
  imageUrl,
  className = '',
}: {
  imageUrl: string;
  className?: string;
}) {
  return (
    <a
      href={buildDownloadUrl(imageUrl)}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1.5 bg-black/60 hover:bg-black/75 text-white text-xs font-semibold px-2.5 py-1.5 rounded transition ${className}`}
      title="Download watermarked image"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Download
    </a>
  );
}
