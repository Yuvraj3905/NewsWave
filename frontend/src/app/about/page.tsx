export const metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-lg border border-navy-100 shadow-card p-6 sm:p-8 dark:bg-navy-800 dark:border-navy-700">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-2 dark:text-white">
          About NewsWave
        </h1>
        <p className="text-sm text-navy-500 mb-6 dark:text-navy-300">
          Your region. Your news. Fast, mobile-first regional and national journalism.
        </p>

        <div className="space-y-5 text-sm text-navy-700 leading-relaxed dark:text-navy-200">
          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1 dark:text-white">Who We Are</h2>
            <p>
              NewsWave is a regional and national news platform covering Punjab,
              Haryana, Chandigarh, and beyond. We publish in English, Hindi, and
              Punjabi so readers get the story in the language they think in.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1 dark:text-white">What We Cover</h2>
            <p>
              Politics, business, sports, entertainment, health, automobile, crime,
              and breaking national stories. Editorial decisions are guided by what
              matters to tier-2 and tier-3 readers, not what trends on metro feeds.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1 dark:text-white">Editorial Standards</h2>
            <p>
              Every story is fact-checked before publishing. Corrections are issued
              transparently. We do not run paid editorial as news. Sponsored content
              is clearly labelled.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1 dark:text-white">Get in Touch</h2>
            <p>
              Story tips, feedback, or partnership queries reach the desk at{' '}
              <a
                href="mailto:editorial@newswave.example"
                className="text-brand-500 font-semibold hover:underline"
              >
                editorial@newswave.example
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
