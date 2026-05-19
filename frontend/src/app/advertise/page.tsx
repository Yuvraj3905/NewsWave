import Link from 'next/link';

export const metadata = { title: 'Advertise With Us' };

export default function AdvertisePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-lg border border-navy-100 shadow-card p-6 sm:p-8 dark:bg-navy-800 dark:border-navy-700">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-2 dark:text-white">
          Advertise With NewsWave
        </h1>
        <p className="text-sm text-navy-500 mb-6 dark:text-navy-300">
          Reach readers across Punjab, Haryana, Chandigarh, and beyond.
        </p>

        <div className="space-y-5 text-sm text-navy-700 leading-relaxed dark:text-navy-200">
          <section>
            <h2 className="font-bold text-navy-900 text-base mb-2 dark:text-white">Why NewsWave</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Trusted regional + national news source</li>
              <li>Mobile-first audience growing fast in tier-2 and tier-3 cities</li>
              <li>Multi-language coverage in English, Hindi, Punjabi</li>
              <li>Engaged newsletter subscriber base</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-2 dark:text-white">Ad Inventory</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: 'Homepage Banner', spec: '970×250 / 728×90' },
                { name: 'In-Article Native', spec: 'Sponsored card mid-article' },
                { name: 'Newsletter Sponsorship', spec: 'One slot per issue' },
                { name: 'Sidebar Display', spec: '300×250' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="border border-navy-100 rounded p-3 bg-surface-50 dark:bg-navy-700 dark:border-navy-600"
                >
                  <div className="font-semibold text-navy-900 dark:text-white">{item.name}</div>
                  <div className="text-xs text-navy-500 mt-0.5 dark:text-navy-300">{item.spec}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-2 dark:text-white">Get in Touch</h2>
            <p>
              Email <a href="mailto:ads@newswave.com" className="text-brand-500 font-semibold hover:underline">ads@newswave.com</a> or use the contact form for media kits and rate cards.
            </p>
            <Link
              href="/contact"
              className="inline-block mt-3 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-4 py-2 rounded"
            >
              Contact Us
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
