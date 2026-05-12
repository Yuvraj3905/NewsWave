import Link from 'next/link';
import { FooterCategoryLinks } from './FooterCategoryLinks';

export function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-extrabold text-2xl">
            <span className="text-white">News</span>
            <span className="text-brand-500">Wave</span>
          </div>
          <p className="text-sm mt-3 text-navy-200 max-w-sm">
            Your trusted source for the latest news from around the world.
          </p>
          <div className="flex items-center gap-2 mt-4">
            {[
              { href: 'https://facebook.com', label: 'Facebook', d: 'M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07C2 17.1 5.66 21.27 10.44 22v-7.02H7.9v-2.91h2.54V9.84c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22C18.34 21.27 22 17.1 22 12.07z' },
              { href: 'https://x.com', label: 'X', d: 'M18.244 2H21.5l-7.5 8.57L22.5 22h-6.86l-5.37-6.97L4 22H.74l8.03-9.18L1.5 2h7.04l4.86 6.42L18.244 2z' },
              { href: 'https://instagram.com', label: 'Instagram', d: 'M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.6-10.9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z' },
              { href: 'https://youtube.com', label: 'YouTube', d: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z' },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-8 h-8 grid place-items-center rounded-full bg-navy-800 hover:bg-brand-500 text-white transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d={s.d} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase text-sm tracking-wider mb-4">
            Quick Links
          </h4>
          <ul className="text-sm space-y-2 text-navy-200">
            <li><Link href="/" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
            <li><Link href="/advertise" className="hover:text-white">Advertise With Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase text-sm tracking-wider mb-4">
            Categories
          </h4>
          <FooterCategoryLinks />
        </div>

        <div>
          <h4 className="text-white font-bold uppercase text-sm tracking-wider mb-4">
            Contact Us
          </h4>
          <ul className="text-sm space-y-2 text-navy-200">
            <li className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <a href="mailto:hello@newswave.com" className="hover:text-white">hello@newswave.com</a>
            </li>
            <li className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
              </svg>
              <a href="tel:+919876543210" className="hover:text-white">+91 98765 43210</a>
            </li>
            <li className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>SCO 123, Sector 17, Chandigarh, India</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-navy-300 flex flex-col md:flex-row justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} NewsWave. All rights reserved.</span>
          <Link href="/admin" className="hover:text-white">Manager Login</Link>
        </div>
      </div>
    </footer>
  );
}
