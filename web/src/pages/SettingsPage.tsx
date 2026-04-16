import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';

type Section = 'account' | 'security' | 'subscription' | 'usage';

interface UsageStats {
  monthlyCount: number;
  freeLimit: number;
  credits: number;
  totalTranslations: number;
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('account');
  const [resending, setResending] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Usage stats
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      const [stats, history] = await Promise.all([
        api<{ plan: string; credits: number; monthlyCount: number; freeLimit: number }>('/translate/stats'),
        api<{ total: number }>('/translate/history?limit=1'),
      ]);
      setUsageStats({
        monthlyCount: stats.monthlyCount,
        freeLimit: stats.freeLimit,
        credits: stats.credits,
        totalTranslations: history.total,
      });
    } catch {
      // silently fail
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await api('/auth/resend-verification', { method: 'POST' });
      showMessage('success', 'Verification email sent! Check your inbox.');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      showMessage('success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const data = await api<{ url: string }>('/payment/portal', { method: 'POST' });
      window.location.href = data.url;
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'subscription', label: 'Subscription', icon: '⚡' },
    { id: 'usage', label: 'Usage', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard"><Logo /></Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/40 text-green-400'
              : 'bg-red-500/10 border-red-500/40 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar nav */}
          <aside className="w-48 shrink-0">
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                    activeSection === item.id
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-6">

            {/* ── Account ── */}
            {activeSection === 'account' && (
              <>
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-semibold">Account Information</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Your profile and email settings</p>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-800/60">
                      <div>
                        <p className="text-sm font-medium">Email address</p>
                        <p className="text-xs text-gray-500 mt-0.5">Used for login and notifications</p>
                      </div>
                      <span className="text-sm text-gray-300">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800/60">
                      <div>
                        <p className="text-sm font-medium">Email verification</p>
                        <p className="text-xs text-gray-500 mt-0.5">Verify your email to unlock all features</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          user?.verified
                            ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {user?.verified ? '✓ Verified' : '⚠ Not verified'}
                        </span>
                        {!user?.verified && (
                          <button
                            onClick={handleResendVerification}
                            disabled={resending}
                            className="text-indigo-400 hover:text-indigo-300 text-xs underline disabled:opacity-50"
                          >
                            {resending ? 'Sending...' : 'Resend email'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="text-sm font-medium">Member since</p>
                        <p className="text-xs text-gray-500 mt-0.5">Account creation date</p>
                      </div>
                      <span className="text-sm text-gray-300">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Security ── */}
            {activeSection === 'security' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h2 className="font-semibold">Change Password</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Update your password to keep your account secure</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Current password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm new password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                      placeholder="Re-enter new password"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition"
                  >
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Subscription ── */}
            {activeSection === 'subscription' && (
              <>
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-semibold">Current Plan</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Manage your subscription and credits</p>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-800/60">
                      <div>
                        <p className="text-sm font-medium">Plan</p>
                      </div>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        user?.plan === 'PRO'
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                          : 'bg-gray-800 text-gray-300 border border-gray-700'
                      }`}>
                        {user?.plan === 'PRO' ? '⚡ Pro' : 'Free'}
                      </span>
                    </div>

                    {user?.plan === 'FREE' && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-800/60">
                        <div>
                          <p className="text-sm font-medium">Credits</p>
                          <p className="text-xs text-gray-500 mt-0.5">One-time purchases, never expire</p>
                        </div>
                        <span className="text-sm text-gray-300">{user?.credits ?? 0} remaining</span>
                      </div>
                    )}

                    {user?.subscription?.currentPeriodEnd && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-800/60">
                        <p className="text-sm font-medium">Next billing date</p>
                        <span className="text-sm text-gray-300">
                          {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      {user?.plan === 'FREE' ? (
                        <>
                          <Link
                            to="/buy-credits"
                            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            Buy Credits
                          </Link>
                          <Link
                            to="/pricing"
                            className="border border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
                          >
                            Upgrade to Pro
                          </Link>
                        </>
                      ) : (
                        <button
                          onClick={handleManageSubscription}
                          disabled={portalLoading}
                          className="border border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                        >
                          {portalLoading ? 'Loading...' : 'Manage Subscription'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Usage ── */}
            {activeSection === 'usage' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h2 className="font-semibold">Usage Statistics</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Your translation activity</p>
                </div>
                <div className="px-6 py-5">
                  {usageStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{usageStats.monthlyCount}</p>
                        <p className="text-xs text-gray-400 mt-1">Translations this month</p>
                        {user?.plan === 'FREE' && usageStats.credits === 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">of {usageStats.freeLimit} free</p>
                        )}
                      </div>
                      <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{usageStats.totalTranslations}</p>
                        <p className="text-xs text-gray-400 mt-1">Total translations</p>
                      </div>
                      {user?.plan === 'FREE' && (
                        <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4">
                          <p className="text-2xl font-bold text-indigo-400">{usageStats.credits}</p>
                          <p className="text-xs text-gray-400 mt-1">Credits remaining</p>
                          {usageStats.credits === 0 && (
                            <Link to="/buy-credits" className="text-xs text-indigo-400 hover:text-indigo-300 underline mt-1 inline-block">
                              Buy more →
                            </Link>
                          )}
                        </div>
                      )}
                      <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white capitalize">{user?.plan?.toLowerCase()}</p>
                        <p className="text-xs text-gray-400 mt-1">Current plan</p>
                        {user?.plan === 'FREE' && (
                          <Link to="/pricing" className="text-xs text-indigo-400 hover:text-indigo-300 underline mt-1 inline-block">
                            Upgrade →
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Loading stats...</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
