export const metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-lg border border-navy-100 shadow-card p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-navy-500 mb-6">Last updated: May 2026</p>

        <div className="space-y-5 text-sm text-navy-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">1. Use of Service</h2>
            <p>
              NewsWave provides news, analysis, and editorial content for
              personal, non-commercial reading. By accessing this site you
              agree to use it for lawful purposes only.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">2. Content Ownership</h2>
            <p>
              All articles, images, and graphics are the property of NewsWave
              or licensed contributors. Reproduction without written permission
              is prohibited.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">3. Accuracy</h2>
            <p>
              We strive for accuracy but make no warranties about completeness
              or reliability. Stories are updated as new information emerges.
              Always verify time-sensitive information from primary sources.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">4. Comments &amp; Submissions</h2>
            <p>
              User-submitted content (story tips, contact form messages) becomes
              the property of NewsWave and may be edited or used in editorial
              coverage.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">5. Liability</h2>
            <p>
              NewsWave is not liable for losses arising from reliance on
              information published on this site.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">6. Changes</h2>
            <p>
              These terms may change without notice. Continued use of the site
              implies acceptance of updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
