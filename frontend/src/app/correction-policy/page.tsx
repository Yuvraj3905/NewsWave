export const metadata = { title: 'Correction & Complaint Policy' };

export default function CorrectionPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-lg border border-navy-100 shadow-card p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-2">
          Correction &amp; Complaint Policy
        </h1>
        <p className="text-sm text-navy-500 mb-6">Last updated: May 2026</p>

        <div className="space-y-5 text-sm text-navy-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">
              1. Our Commitment to Accuracy
            </h2>
            <p>
              NewsWave is committed to fair, accurate, and transparent reporting.
              Despite our editorial checks, factual errors may occasionally
              appear. When they do, we correct them promptly and visibly.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">
              2. How Corrections Are Made
            </h2>
            <p>
              Verified factual errors are corrected in the original article. A
              dated correction note is added at the bottom of the article
              explaining what was changed and why. Significant corrections may
              also be flagged at the top of the article.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">
              3. Filing a Complaint or Correction Request
            </h2>
            <p>
              If you believe an article contains a factual error or violates our
              editorial standards, please write to{' '}
              <a
                href="mailto:hello@newswave.com"
                className="text-brand-600 hover:underline"
              >
                hello@newswave.com
              </a>{' '}
              with the article link, the specific claim in question, and
              supporting evidence. Include your name and a way to contact you so
              we can follow up.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">
              4. Review Timeline
            </h2>
            <p>
              We acknowledge complaints within 48 hours. Most reviews are
              resolved within 5 working days. Complex matters that require
              additional reporting or legal review may take longer; we will keep
              you informed in such cases.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">
              5. Editorial Transparency
            </h2>
            <p>
              We do not silently edit published articles to alter their meaning.
              Minor typo and formatting fixes are made without a note. Material
              changes to facts, quotes, or interpretation are always disclosed.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">
              6. Right of Reply
            </h2>
            <p>
              Individuals or organisations named in an article who believe they
              have been misrepresented may request a right of reply, which the
              editorial team will consider in good faith.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">
              7. Contact
            </h2>
            <p>
              Editor, NewsWave &mdash;{' '}
              <a
                href="mailto:hello@newswave.com"
                className="text-brand-600 hover:underline"
              >
                hello@newswave.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
