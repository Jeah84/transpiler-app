import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto border-b border-gray-800">
        <Link to="/" className="text-lg font-bold text-white tracking-tight hover:text-blue-400 transition-colors">
          ← Transpiler
        </Link>
        <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
          Log in
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: April 12, 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              Transpiler ("we", "us", "our") is committed to protecting your privacy. This Privacy
              Policy explains what information we collect, how we use it, and your rights regarding
              your data when you use the Service at transpiler.us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <h3 className="text-white font-semibold mt-4 mb-2">a) Account Information</h3>
            <p>
              When you register, we collect your email address and a hashed version of your
              password. We do not store plain-text passwords.
            </p>
            <h3 className="text-white font-semibold mt-4 mb-2">b) Usage Data</h3>
            <p>
              We log the number of translations you perform and the source/target language pairs
              selected. We do not permanently store the code content you submit or the translated
              output after your session ends.
            </p>
            <h3 className="text-white font-semibold mt-4 mb-2">c) Payment Information</h3>
            <p>
              Payments are handled entirely by Stripe. We never see or store your full card number,
              CVV, or bank details. We only store a Stripe customer ID and subscription status in
              our database.
            </p>
            <h3 className="text-white font-semibold mt-4 mb-2">d) Technical Data</h3>
            <p>
              We may collect IP addresses, browser type, and request timestamps for security and
              abuse prevention purposes. This data is not sold or shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>To provide, maintain, and improve the Service</li>
              <li>To manage your account, subscription, and billing</li>
              <li>To send transactional emails (email verification, billing receipts)</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="mt-3">
              We do not send marketing emails without your explicit consent, and we do not sell
              your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-3">
              We use the following third-party services to operate Transpiler:
            </p>
            <div className="space-y-3">
              {[
                {
                  name: 'Stripe',
                  url: 'https://stripe.com/privacy',
                  desc: 'Payment processing. Stripe is PCI-DSS Level 1 certified. Their privacy policy governs how your payment data is handled.',
                },
                {
                  name: 'Brevo (Sendinblue)',
                  url: 'https://www.brevo.com/legal/privacypolicy/',
                  desc: 'Transactional email delivery (email verification, receipts).',
                },
                {
                  name: 'Railway',
                  url: 'https://railway.app/legal/privacy',
                  desc: 'Backend infrastructure and database hosting.',
                },
                {
                  name: 'Together.ai',
                  url: 'https://www.together.ai/privacy',
                  desc: 'AI inference (Llama 3.3 70B). Code submitted for translation is sent to Together.ai for processing and is subject to their data handling policies.',
                },
              ].map(({ name, url, desc }) => (
                <div key={name} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    {name}
                  </a>
                  <p className="text-gray-400 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. If you delete
              your account, we will delete your personal information within 30 days, except where
              retention is required for legal or billing purposes (e.g., payment records may be
              retained for up to 7 years for tax compliance).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-400">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability (receive your data in a machine-readable format)</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@transpiler.us" className="text-blue-400 hover:underline">
                support@transpiler.us
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
            <p>
              Transpiler uses only essential session cookies required for authentication and
              security. We do not use tracking cookies or third-party analytics cookies. No cookie
              consent banner is required for essential cookies under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Children's Privacy</h2>
            <p>
              The Service is not directed to children under 13. We do not knowingly collect
              personal information from children. If you believe a child has provided us with
              personal data, contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your data,
              including encrypted connections (HTTPS/TLS), hashed passwords, and access controls
              on our infrastructure. No system is perfectly secure; we cannot guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users
              of material changes via email. The "Last updated" date at the top of this page will
              always reflect the most recent version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact</h2>
            <p>
              For privacy questions or requests, contact us at{' '}
              <a href="mailto:support@transpiler.us" className="text-blue-400 hover:underline">
                support@transpiler.us
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-gray-800 mt-8 px-6 py-8">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-300 transition-colors">← Back to Home</Link>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <a href="mailto:support@transpiler.us" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
