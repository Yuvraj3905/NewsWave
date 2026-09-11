// ponytail: Cloudinary already resizes/optimizes; Vercel's optimizer just burned quota (402).
// Insert w_/q_ right after /upload/ so it chains before any baked-in transforms
// (resize first, then overlays scale with the final size).
export default function cloudinaryLoader({ src, width, quality }) {
  const i = src.indexOf('/image/upload/');
  if (i === -1) return src; // non-Cloudinary (unsplash, local) -> serve as-is
  const cut = i + '/image/upload/'.length;
  return `${src.slice(0, cut)}w_${width},q_${quality || 75},f_auto/${src.slice(cut)}`;
}
