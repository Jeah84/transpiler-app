import { Link } from 'react-router-dom';

export default function TermsOfService() {
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
        <h1 className="text-4xl font-extrabold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: April 12, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Transpiler ("the Service") at transpiler.us, you agree to be
              bound by these Terms of Service ("Terms"). If you do not agree, do not use the
              Service. These Terms apply to all visitors, registered users, and paying subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>
              Transpiler is an AI-powered code translation tool that converts source code between
              27 programming languages. The Service is provided "as is" and may change or be
              discontinued at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Accounts and Registration</h2>
            <p>
              You must provide a valid email address and verify it to use the Service. You are
              responsible for maintaining the confidentiality of your account credentials and for
              all activity that occurs under your account. Notify us immediately at{' '}
              <a href="mailto:support@transpiler.us" className="text-blue-400 hover:underline">
                support@transpiler.us
              </a>{' '}
              of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Free and Pro Plans</h2>
            <p>
              The Free plan includes up to 10 code translations per calendar month. The Transpiler
              Pro plan, at $20 per month, includes unlimited translations and is billed on a
              recurring monthly basis. Prices are subject to change with 30 days' notice to
              existing subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Billing and Cancellation</h2>
            <p>
              Pro subscriptions are billed monthly via Stripe. By subscribing, you authorize
              Transpiler to charge your payment method on a recurring basis. You may cancel at any
              time from your account settings; cancellation takes effect at the end of the current
              billing period. No partial-month refunds are issued except as described in Section 6.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Refund Policy</h2>
            <p>
              If you are not satisfied with your Pro subscription, you may request a full refund
              within 7 days of your initial charge, provided you have not performed more than 5
              Pro translations. Refund requests must be submitted to{' '}
              <a href="mailto:support@transpiler.us" className="text-blue-400 hover:underline">
                support@transpiler.us
              </a>
              . After the 7-day window, charges are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-400">
              <li>Translate, distribute, or reproduce code you do not have the right to use</li>
              <li>Attempt to reverse engineer, scrape, or extract the underlying AI model</li>
              <li>Automate requests in a manner that abuses the Service or degrades performance for others</li>
              <li>Use the Service for any unlawful purpose or in violation of any applicable regulations</li>
              <li>Resell or redistribute outputs of the Service without prior written consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Intellectual Property</h2>
            <p>
              You retain ownership of the code you submit ("Input") and the translated code you
              receive ("Output"). Transpiler does not claim any ownership over your Input or
              Output. You grant Transpiler a limited, non-exclusive license to process your Input
              solely for the purpose of providing the translation Service.
            </p>
            <p className="mt-3">
              The Transpiler platform, branding, and underlying systems are the intellectual
              property of Transpiler and may not be copied or used without permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Accuracy Disclaimer</h2>
            <p>
              AI-generated code translations may contain errors, omissions, or inaccuracies.
              Always review and test translated code before using it in production. Transpiler is
              not responsible for defects, bugs, or damages arising from reliance on translated
              output.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Transpiler and its operators shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages
              arising from your use of the Service, including loss of data, revenue, or profits,
              even if advised of the possibility of such damages. Our total liability shall not
              exceed the amount you paid us in the 3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at our discretion if you
              violate these Terms. Upon termination, your right to use the Service ceases
              immediately. We will not issue refunds for accounts terminated due to Terms violations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without
              regard to conflict of law provisions. Any disputes shall be resolved in the courts
              located in Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. We will notify registered users of material
              changes via email. Continued use of the Service after changes constitutes acceptance
              of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
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
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <a href="mailto:support@transpiler.us" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
