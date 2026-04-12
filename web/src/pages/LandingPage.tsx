import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Translate Code Between Languages Instantly
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Powered by AI. Convert code between 27+ programming languages with a single click.
          Preserve logic, structure, and idioms.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg font-medium text-lg transition-colors">
            Start Translating Free
          </Link>
          <Link to="/pricing" className="border border-gray-600 hover:border-gray-500 px-8 py-3 rounded-lg font-medium text-lg transition-colors">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Transpiler?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: '27+ Languages',
              desc: 'From Python to Rust, JavaScript to Go — we support all the languages you need.',
              icon: '🌐',
            },
            {
              title: 'AI-Powered Accuracy',
              desc: 'Using Llama 3.3 70B for intelligent, context-aware code translation.',
              icon: '🤖',
            },
            {
              title: 'Instant Results',
              desc: 'Get your translated code in seconds, ready to use in your project.',
              icon: '⚡',
            },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <p className="text-3xl font-bold mb-4">$0<span className="text-lg text-gray-500">/mo</span></p>
            <ul className="space-y-2 text-gray-400 mb-6">
              <li>✓ 5 translations per day</li>
              <li>✓ 27+ languages</li>
              <li>✓ Translation history</li>
            </ul>
            <Link to="/register" className="block text-center border border-gray-600 hover:border-gray-500 px-6 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
          <div className="bg-gray-900 border-2 border-indigo-500 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <p className="text-3xl font-bold mb-4">$9<span className="text-lg text-gray-500">/mo</span></p>
            <ul className="space-y-2 text-gray-400 mb-6">
              <li>✓ 100 translations per day</li>
              <li>✓ 27+ languages</li>
              <li>✓ Translation history</li>
              <li>✓ Priority support</li>
            </ul>
            <Link to="/register" className="block text-center bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-medium transition-colors">
              Start Pro Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Transpiler. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
