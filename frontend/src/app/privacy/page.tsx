export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-lg border border-navy-100 shadow-card p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-navy-500 mb-6">Last updated: May 2026</p>

        <div className="space-y-5 text-sm text-navy-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">1. Information We Collect</h2>
            <p>
              NewsWave collects email addresses for newsletter subscriptions and
              anonymous analytics data via Google Analytics 4. We do not collect
              names, phone numbers, or location data unless explicitly provided
              through contact forms.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">2. How We Use It</h2>
            <p>
              Subscriber emails are used solely to send news updates. Analytics
              data informs editorial decisions and never identifies individuals.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">3. Cookies</h2>
            <p>
              We use a single cookie to remember your language preference. GA4
              uses standard analytics cookies. You can clear these from your
              browser at any time.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">4. Third Parties</h2>
            <p>
              Embedded social posts may set their own cookies. Newsletter is
              processed by our backend; we never sell or share subscriber data.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-navy-900 text-base mb-1">5. Your Rights</h2>
            <p>
              You may unsubscribe at any time via the link in newsletter emails
              or contact us at hello@newswave.com to request data deletion.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
