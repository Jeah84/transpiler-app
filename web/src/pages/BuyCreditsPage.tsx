import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { api } from '../lib/api';

interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular: boolean;
}

const BuyCreditsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  useEffect(() => {
    api<CreditPack[]>('/payment/credit-packs').then(packs => setPacks(packs));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBuy = async (packId: string) => {
    setLoading(true);
    setSelectedPack(packId);
    try {
      const res = await api<{ url: string }>('/payment/buy-credits', { method: 'POST', body: { packId } });
      window.location.href = res.url;
    } catch (err) {
      console.error('Failed to create checkout session', err);
      setLoading(false);
      setSelectedPack(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link>
            <Link to="/settings" className="text-gray-400 hover:text-white text-sm">Settings</Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Buy Credits</h1>
          <p className="text-gray-400">Each credit = one translation. Credits never expire.</p>
          {user?.plan === 'FREE' && (
            <p className="text-sm text-indigo-400 mt-2">
              Want unlimited translations?{' '}
              <Link to="/pricing" className="underline hover:text-indigo-300">Upgrade to Pro for $20/month</Link>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {packs.map(pack => (
            <div
              key={pack.id}
              className={`relative rounded-xl border p-6 flex flex-col gap-4 ${
                pack.popular
                  ? 'border-indigo-500 bg-indigo-900/20'
                  : 'border-gray-700 bg-gray-900'
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{pack.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{pack.description}</p>
              </div>
              <div className="text-3xl font-bold">
                ${(pack.price / 100).toFixed(2)}
                <span className="text-sm font-normal text-gray-400 ml-1">one-time</span>
              </div>
              <ul className="text-sm text-gray-300 space-y-1 flex-1">
                <li>✓ {pack.credits} translations</li>
                <li>✓ Credits never expire</li>
                <li>✓ All 27 languages</li>
                <li>✓ No subscription required</li>
              </ul>
              <button
                onClick={() => handleBuy(pack.id)}
                disabled={loading && selectedPack === pack.id}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  pack.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                } disabled:opacity-50`}
              >
                {loading && selectedPack === pack.id ? 'Redirecting...' : `Buy ${pack.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500">
          Payments processed securely by Stripe. Credits are added instantly after purchase.
        </div>
      </div>
    </div>
  );
};

export default BuyCreditsPage;
