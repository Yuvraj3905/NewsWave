import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GoogleTranslate } from '@/components/GoogleTranslate';
import { LocationProvider } from '@/components/LocationContext';
import { LanguageProvider } from '@/components/LanguageContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GA4 } from '@/components/GA4';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const apiOrigin = (() => {
  try {
    const u = new URL(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    );
    return u.origin;
  } catch {
    return null;
  }
})();

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('newswave:theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  title: {
    default: 'NewsWave - Regional & National News',
    template: '%s | NewsWave',
  },
  description:
    'Fast, mobile-first regional and national news. Categorized, localized, and updated continuously.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ),
  openGraph: {
    type: 'website',
    siteName: 'NewsWave',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Static literal, no user input. Prevents flash of incorrect theme.
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        {apiOrigin && (
          <>
            <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-surface-50 dark:bg-navy-900 dark:text-navy-50 transition-colors">
        <ThemeProvider>
          <LanguageProvider>
            <LocationProvider>
              <Header />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
              <GoogleTranslate />
              <GA4 />
            </LocationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
