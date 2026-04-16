import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { api } from '../lib/api';

const CREDIT_PACKS = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: '$2.99',
    description: 'Great for trying it out',
    popular: false,
  },
  {
    id: 'builder',
    name: 'Builder',
    credits: 200,
    price: '$7.99',
    description: 'For regular use',
    popular: true,
  },
  {
    id: 'power',
    name: 'Power',
    credits: 500,
    price: '$14.99',
    description: 'For heavy projects',
    popular: false,
  },
];

const PricingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loadingPro, setLoadingPro] = useState(false);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProUpgrade = async () => {
    if (!user) { navigate('/register'); return; }
    setLoadingPro(true);
    try {
      const res = await api<{ url: string }>('/payment/create-checkout-session', { method: 'POST' });
      window.location.href = res.url;
    } catch {
      setLoadingPro(false);
    }
  };

  const handleBuyCredits = async (packId: string) => {
    if (!user) { navigate('/register'); return; }
    setLoadingPack(packId);
    try {
      const res = await api<{ url: string }>('/payment/buy-credits', { method: 'POST', body: { packId } });
      window.location.href = res.url;
    } catch {
      setLoadingPack(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link>
                <Link to="/settings" className="text-gray-400 hover:text-white text-sm">Settings</Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white text-sm">Log in</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple, Honest Pricing</h1>
          <p className="text-gray-400 text-lg">Pay only for what you use, or go unlimited with Pro.</p>
        </div>

        {/* Free Tier */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Free Tier</h2>
            <p className="text-gray-400 mt-1">10 translations per month, no credit card required.</p>
          </div>
          <div className="text-2xl font-bold text-gray-300">$0</div>
        </div>

        {/* Credit Packs */}
        <h2 className="text-2xl font-bold mb-4 text-center">Credit Packs <span className="text-gray-400 font-normal text-base ml-2">One-time purchase · Never expire</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {CREDIT_PACKS.map(pack => (
            <div
              key={pack.id}
              className="group relative rounded-xl border border-gray-700 bg-gray-900 p-6 flex flex-col gap-4 transition-all duration-200 hover:border-indigo-500 hover:bg-indigo-950/30 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold group-hover:text-indigo-300 transition-colors">{pack.name}</h3>
                <p className="text-gray-400 text-sm">{pack.description}</p>
              </div>
              <div className="text-3xl font-bold group-hover:text-indigo-300 transition-colors">{pack.price}</div>
              <p className="text-gray-300 text-sm">{pack.credits} translations</p>
              <button
                onClick={() => handleBuyCredits(pack.id)}
                disabled={loadingPack === pack.id}
                className="w-full py-2 rounded-lg font-semibold transition bg-gray-800 border border-gray-700 text-gray-300 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white disabled:opacity-50"
              >
                {loadingPack === pack.id ? 'Redirecting...' : `Buy ${pack.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Pro Plan */}
        <div className="relative bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500 rounded-xl p-8">
          <div className="absolute -top-3 left-8 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            Best Value for Power Users
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">Pro Plan</h2>
              <p className="text-gray-300 mt-1">Unlimited translations, every month. No counting, no limits.</p>
              <ul className="mt-4 space-y-1 text-sm text-gray-300">
                <li>✓ Unlimited translations</li>
                <li>✓ All 27 languages</li>
                <li>✓ Developer tools (Regex, JSON/YAML, Code Review)</li>
                <li>✓ Priority support</li>
                <li>✓ Cancel anytime</li>
              </ul>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl font-bold">$20<span className="text-lg font-normal text-gray-400">/mo</span></div>
              {user?.plan === 'PRO' ? (
                <div className="bg-green-600/20 border border-green-500 text-green-400 px-4 py-2 rounded-lg text-sm font-semibold">
                  ✓ Current Plan
                </div>
              ) : (
                <button
                  onClick={handleProUpgrade}
                  disabled={loadingPro}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                >
                  {loadingPro ? 'Redirecting...' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Payments processed securely by Stripe. Credit packs never expire.{' '}
          <Link to="/terms" className="underline hover:text-gray-400">Terms</Link> ·{' '}
          <Link to="/privacy" className="underline hover:text-gray-400">Privacy</Link>
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
