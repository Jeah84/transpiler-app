import { Link } from 'react-router-dom';


export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/transpiler-banner.png" className="h-9 object-contain" alt="Transpiler" />
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-blue-300 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Powered by Llama 3.3 70B · 27 Languages
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
          Translate Code Between<br />
          <span className="text-blue-400">Languages Instantly</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Paste code in any language — get clean, accurate output in another. From Python to Rust,
          JavaScript to Go, TypeScript to Java. No setup, no guesswork.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-base"
          >
            Start Translating Free
          </Link>
          <Link
            to="/pricing"
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors text-base border border-gray-700"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* How to Use */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">How to Use Transpiler</h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Get your code translated in three simple steps — no IDE, no plugins, no friction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Paste Your Code',
              description:
                'Open the dashboard, select your source language, and paste the code you want to translate. Supports full files or individual functions.',
              icon: (
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              step: '02',
              title: 'Choose Your Target Language',
              description:
                'Pick the destination language from 27 supported options — Python, TypeScript, Rust, Go, Java, C#, Swift, Kotlin, and more.',
              icon: (
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              ),
            },
            {
              step: '03',
              title: 'Copy and Use',
              description:
                'Hit Translate and get clean, idiomatic code in seconds. Copy the result directly into your project. Free plan includes 10 translations/month.',
              icon: (
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ),
            },
          ].map(({ step, title, description, icon }) => (
            <div
              key={step}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-4xl font-black text-gray-800 select-none">
                {step}
              </div>
              <div className="mb-4">{icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Transpiler */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Why Transpiler?</h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              Built for developers who work across stacks and need accurate translations fast.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '27+ Languages',
                description:
                  'From Python and JavaScript to Rust, Go, Haskell, and beyond. We cover the full spectrum of modern and systems languages.',
                icon: '🌐',
              },
              {
                title: 'AI-Powered Accuracy',
                description:
                  'Llama 3.3 70B understands context, idioms, and patterns — producing code that feels native, not just syntactically converted.',
                icon: '🤖',
              },
              {
                title: 'Instant Results',
                description:
                  'No waiting for compilation or processing queues. Translations complete in seconds so you can stay in flow.',
                icon: '⚡',
              },
            ].map(({ title, description, icon }) => (
              <div
                key={title}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Languages Banner */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-6 font-medium">
          Supported Languages
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go', 'Java', 'C#', 'C++',
            'C', 'Swift', 'Kotlin', 'Ruby', 'PHP', 'Scala', 'Haskell', 'Elixir',
            'Clojure', 'Lua', 'Perl', 'R', 'MATLAB', 'Julia', 'Dart', 'Zig',
            'Nim', 'OCaml', 'F#',
          ].map((lang) => (
            <span
              key={lang}
              className="bg-gray-900 border border-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full font-mono"
            >
              {lang}
            </span>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-950 to-gray-900 border border-blue-800 rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to translate your first file?</h2>
          <p className="text-gray-400 mb-6 text-base">
            Free account. No credit card required. 10 translations included every month.
          </p>
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-base inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Legal / Payment Terms */}
      <section className="px-6 py-10 max-w-3xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-sm text-gray-500 leading-relaxed">
          <h3 className="text-gray-300 font-semibold text-base mb-3">Payment & Billing Terms</h3>
          <p className="mb-3">
            Transpiler Pro is a monthly subscription at <strong className="text-gray-300">$20 / month</strong>, billed
            automatically each month on the date you subscribe. Payments are processed securely by{' '}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Stripe
            </a>
            , a PCI-DSS Level 1 certified payment processor. Transpiler does not store your card
            details.
          </p>
          <p className="mb-3">
            You may cancel your subscription at any time from your account settings. Cancellation
            takes effect at the end of the current billing period — you will retain Pro access until
            that date and will not be charged again after cancellation.
          </p>
          <p className="mb-3">
            Refunds are available within <strong className="text-gray-300">7 days</strong> of initial
            purchase if you have not used more than 5 Pro translations. To request a refund, contact{' '}
            <a href="mailto:support@transpiler.us" className="text-blue-400 hover:underline">
              support@transpiler.us
            </a>
            .
          </p>
          <p>
            By subscribing, you agree to our{' '}
            <Link to="/terms" className="text-blue-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-400 hover:underline">
              Privacy Policy
            </Link>
            . Stripe's{' '}
            <a
              href="https://stripe.com/legal/ssa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Services Agreement
            </a>{' '}
            and{' '}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Privacy Policy
            </a>{' '}
            also apply to payment processing.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/transpiler-banner.png" className="h-6 object-contain opacity-60" alt="Transpiler" />
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/pricing" className="hover:text-gray-300 transition-colors">Pricing</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <a href="mailto:support@transpiler.us" className="hover:text-gray-300 transition-colors">
              Contact
            </a>
          </div>
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Transpiler. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
