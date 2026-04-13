import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';

export function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api<{ url: string }>('/payment/create-checkout-session', { method: 'POST' });
      window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white text-sm">Log in</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">Choose Your Plan</h1>
        <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
          Start free and upgrade when you need more translations. Cancel anytime.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <p className="text-4xl font-bold mb-1">$0</p>
            <p className="text-gray-500 mb-6">Free forever</p>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 5 translations per day
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 27+ programming languages
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Translation history
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> AI-powered translations
              </li>
            </ul>
            {user?.plan === 'FREE' ? (
              <div className="text-center text-gray-500 border border-gray-700 px-6 py-2 rounded-lg">
                Current Plan
              </div>
            ) : !user ? (
              <Link to="/register" className="block text-center border border-gray-600 hover:border-gray-500 px-6 py-2 rounded-lg transition-colors">
                Get Started
              </Link>
            ) : null}
          </div>

          {/* Pro */}
          <div className="bg-gray-900 border-2 border-indigo-500 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
              Recommended
            </div>
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <p className="text-4xl font-bold mb-1">$20<span className="text-lg text-gray-500">/mo</span></p>
            <p className="text-gray-500 mb-6">Billed monthly</p>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 100 translations per day
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 27+ programming languages
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Translation history
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> AI-powered translations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Priority support
              </li>
            </ul>
            {user?.plan === 'PRO' ? (
              <div className="text-center text-indigo-400 border border-indigo-500 px-6 py-2 rounded-lg">
                Current Plan
              </div>
            ) : user ? (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            ) : (
              <Link to="/register" className="block text-center bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-medium transition-colors">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
