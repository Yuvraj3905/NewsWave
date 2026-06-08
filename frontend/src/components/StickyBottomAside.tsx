'use client';

import { useEffect, useRef, useState } from 'react';

const GAP = 24; // px gap from viewport bottom when pinned (matches lg:bottom-6)

/**
 * Sidebar that scrolls with the page until its bottom (the subscribe box)
 * reaches the bottom of the viewport, then stays pinned there.
 *
 * Native `position: sticky; bottom: 0` does NOT pin on downward scroll when
 * the element is taller than the viewport. The trick: use sticky `top` with a
 * negative offset equal to (viewportHeight - asideHeight - gap). The element
 * then scrolls up normally until its top hits that offset — at which point its
 * bottom rests `gap` px above the viewport bottom and stays pinned.
 *
 * When the sidebar is shorter than the viewport we fall back to a normal
 * top-pinned sticky (top-24) so it just sticks near the top.
 */
export function StickyBottomAside({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [topPx, setTopPx] = useState<number>(96); // 24 * 4 = top-24 fallback

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const recompute = () => {
      // lg breakpoint — below it the sidebar is full-width and not sticky.
      if (window.innerWidth < 1024) {
        setTopPx(96);
        return;
      }
      const h = el.offsetHeight;
      const vh = window.innerHeight;
      if (h + GAP <= vh) {
        // Fits on screen — behave like a normal top-sticky sidebar.
        setTopPx(96);
      } else {
        // Taller than viewport — pin the bottom GAP px above the fold.
        setTopPx(vh - h - GAP);
      }
    };

    recompute();

    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, []);

  return (
    <aside
      ref={ref}
      className="space-y-5 lg:sticky lg:self-start"
      style={{ top: `${topPx}px` }}
    >
      {children}
    </aside>
  );
}
