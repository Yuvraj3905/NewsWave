export const metadata = {
  title: 'Contact Us',
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg border border-ink-300/40 shadow-card p-8 dark:bg-navy-800 dark:border-navy-700">
        <h1 className="text-2xl font-extrabold text-brand-900 dark:text-white">Contact Us</h1>
        <p className="text-sm text-ink-500 mt-1 dark:text-navy-300">
          Reach out for press queries, story tips, or partnership opportunities.
        </p>
        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-ink-700 dark:text-navy-100">Editorial</dt>
            <dd className="text-ink-500 dark:text-navy-300">editorial@newswave.example</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-700 dark:text-navy-100">Advertising</dt>
            <dd className="text-ink-500 dark:text-navy-300">ads@newswave.example</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-700 dark:text-navy-100">Office</dt>
            <dd className="text-ink-500 dark:text-navy-300">
              Sector 17, Chandigarh, India
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
