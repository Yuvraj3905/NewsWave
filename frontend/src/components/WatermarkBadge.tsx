const LOGO_URL =
  'https://res.cloudinary.com/dfqrnqcvl/image/upload/f_auto,q_auto,w_200/newswave/logo.png';

// Fixed-position brand mark drawn in CSS, not baked into the image bytes, so it stays
// put regardless of how object-cover crops the source per its aspect ratio.
export function WatermarkBadge({ className = 'w-16' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt=""
      aria-hidden="true"
      className={`absolute top-2 right-2 opacity-70 pointer-events-none select-none ${className}`}
    />
  );
}
