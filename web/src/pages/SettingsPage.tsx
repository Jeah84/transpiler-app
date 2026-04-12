import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  const handleResendVerification = async () => {
    setResending(true);
    setMessage('');
    try {
      await api('/auth/resend-verification', { method: 'POST' });
      setMessage('Verification email sent! Check your inbox.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const data = await api<{ url: string }>('/payment/portal', { method: 'POST' });
      window.location.href = data.url;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        {message && (
          <div className="bg-indigo-500/10 border border-indigo-500/50 text-indigo-400 px-4 py-2 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Account */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Email verified</span>
              <div className="flex items-center gap-2">
                <span className={user?.emailVerified ? 'text-green-400' : 'text-yellow-400'}>
                  {user?.emailVerified ? 'Verified' : 'Not verified'}
                </span>
                {!user?.emailVerified && (
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="text-indigo-400 hover:text-indigo-300 text-xs"
                  >
                    {resending ? 'Sending...' : 'Resend'}
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Member since</span>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current plan</span>
              <span className={user?.plan === 'PRO' ? 'text-indigo-400 font-medium' : ''}>
                {user?.plan || 'FREE'}
              </span>
            </div>
            {user?.subscription?.currentPeriodEnd && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Next billing date</span>
                <span>{new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            {user?.plan === 'FREE' ? (
              <Link
                to="/pricing"
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Upgrade to Pro
              </Link>
            ) : (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="border border-gray-600 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {portalLoading ? 'Loading...' : 'Manage Subscription'}
              </button>
            )}
          </div>
        </div>

        <Link to="/dashboard" className="inline-block text-indigo-400 hover:text-indigo-300 text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
