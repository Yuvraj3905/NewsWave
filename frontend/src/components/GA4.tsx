'use client';

import Script from 'next/script';
import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

// App Router client navigations don't re-fire gtag's page_view. This sends one
// on every path/query change (and on first mount). Config sets
// send_page_view:false so we own every pageview here and avoid double-counting.
function PageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (!GA_ID || !gtag) return;
    const qs = searchParams?.toString();
    gtag('event', 'page_view', {
      page_path: qs ? `${pathname}?${qs}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GA4() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
      {/* useSearchParams needs a Suspense boundary in the App Router. */}
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
    </>
  );
}
