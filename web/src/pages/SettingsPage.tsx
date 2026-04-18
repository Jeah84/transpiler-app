import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';
import { useTheme, ACCENT_THEMES, type ThemeMode, type AccentTheme } from '../context/ThemeContext';
import { useEditorPreferences, EDITOR_FONTS, EDITOR_SIZES, type EditorFont, type EditorFontSize, type EditorCursor } from '../hooks/useEditorPreferences';

type Section = 'account' | 'security' | 'subscription' | 'usage' | 'appearance' | 'connected-apps';

interface UsageStats {
  monthlyCount: number;
  freeLimit: number;
  credits: number;
  totalTranslations: number;
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { mode, accent, setMode, setAccent } = useTheme();
  const { prefs, update: updatePrefs } = useEditorPreferences();
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
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [githubLoading, setGithubLoading] = useState(true);
  const [githubDisconnecting, setGithubDisconnecting] = useState(false);

  useEffect(() => {
    loadUsageStats();
    api<{ connected: boolean; username: string | null }>('/github/status')
      .then(d => { setGithubConnected(d.connected); setGithubUsername(d.username); })
      .catch(() => {}).finally(() => setGithubLoading(false));
    const params = new URLSearchParams(window.location.search);
    const gp = params.get('github');
    const sp = params.get('section') as Section | null;
    if (sp) setActiveSection(sp);
    if (gp === 'connected') showMessage('success', `GitHub connected as @${params.get('username')}`);
    if (gp === 'error') showMessage('error', 'GitHub connection failed. Please try again.');
    if (gp) window.history.replaceState({}, '', window.location.pathname);
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

  const handleGithubDisconnect = async () => {
    setGithubDisconnecting(true);
    try {
      await api('/github/disconnect', { method: 'DELETE' });
      setGithubConnected(false); setGithubUsername(null);
      showMessage('success', 'GitHub disconnected');
    } catch { showMessage('error', 'Failed to disconnect'); }
    finally { setGithubDisconnecting(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: 'account',    label: 'Account',    icon: '👤' },
    { id: 'security',   label: 'Security',   icon: '🔒' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'subscription', label: 'Subscription', icon: '⚡' },
    { id: 'usage',      label: 'Usage',      icon: '📊' },
    { id: 'connected-apps', label: 'Connected Apps', icon: '🔗' },
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

            {/* ── Appearance ── */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">

                {/* Theme mode */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-semibold">Theme</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Choose how the app looks</p>
                  </div>
                  <div className="px-6 py-5">
                    <div className="flex gap-3">
                      {(['dark', 'light', 'auto'] as ThemeMode[]).map(m => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={`flex-1 py-3 rounded-lg border text-sm font-medium capitalize transition ${
                            mode === m
                              ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                          }`}
                        >
                          {m === 'dark' ? '🌙 Dark' : m === 'light' ? '☀️ Light' : '⚙️ Auto'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accent color */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-semibold">Accent Color</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user?.plan === 'PRO' ? 'All accents unlocked' : 'Free: 2 colors • Pro: 9 colors'}
                    </p>
                  </div>
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-3 gap-3">
                      {(Object.entries(ACCENT_THEMES) as [AccentTheme, typeof ACCENT_THEMES[AccentTheme]][]).map(([key, cfg]) => {
                        const locked = cfg.proOnly && user?.plan !== 'PRO';
                        return (
                          <button
                            key={key}
                            onClick={() => !locked && setAccent(key)}
                            disabled={locked}
                            className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition ${
                              accent === key
                                ? 'border-indigo-500 bg-indigo-600/20 text-white'
                                : locked
                                  ? 'border-gray-800 bg-gray-800/40 text-gray-600 cursor-not-allowed'
                                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:text-white'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-gray-900"
                              style={{ backgroundColor: cfg.primary, outline: accent === key ? `2px solid ${cfg.primary}` : '2px solid transparent', outlineOffset: '2px' }}
                            />
                            <span className="truncate">{cfg.label}</span>
                            {locked && <span className="ml-auto text-xs">🔒</span>}
                          </button>
                        );
                      })}
                    </div>
                    {user?.plan !== 'PRO' && (
                      <p className="text-xs text-gray-500 mt-3">
                        <Link to="/pricing" className="text-indigo-400 hover:text-indigo-300 underline">Upgrade to Pro</Link> to unlock all accent colors.
                      </p>
                    )}
                  </div>
                </div>

                {/* Editor preferences */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-semibold">Code Editor</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Customize the editor font and behavior</p>
                  </div>
                  <div className="px-6 py-5 space-y-5">

                    {/* Font family */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {EDITOR_FONTS.map(f => {
                          const locked = f.proOnly && user?.plan !== 'PRO';
                          return (
                            <button
                              key={f.value}
                              onClick={() => !locked && updatePrefs({ font: f.value as EditorFont })}
                              disabled={locked}
                              className={`px-3 py-2 rounded-lg border text-sm transition text-left ${
                                prefs.font === f.value
                                  ? 'border-indigo-500 bg-indigo-600/20 text-white'
                                  : locked
                                    ? 'border-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:text-white'
                              }`}
                              style={{ fontFamily: `'${f.value}', monospace` }}
                            >
                              {f.label} {locked && '🔒'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                      <div className="flex gap-2 flex-wrap">
                        {EDITOR_SIZES.map(size => (
                          <button
                            key={size}
                            onClick={() => updatePrefs({ fontSize: size as EditorFontSize })}
                            className={`w-14 py-2 rounded-lg border text-sm transition ${
                              prefs.fontSize === size
                                ? 'border-indigo-500 bg-indigo-600/20 text-white'
                                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:text-white'
                            }`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cursor style */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Cursor Style</label>
                      <div className="flex gap-2">
                        {(['line', 'block', 'underline'] as EditorCursor[]).map(c => (
                          <button
                            key={c}
                            onClick={() => updatePrefs({ cursor: c })}
                            className={`px-4 py-2 rounded-lg border text-sm capitalize transition ${
                              prefs.cursor === c
                                ? 'border-indigo-500 bg-indigo-600/20 text-white'
                                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:text-white'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Word wrap */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-800/60">
                      <div>
                        <p className="text-sm font-medium">Word Wrap</p>
                        <p className="text-xs text-gray-500 mt-0.5">Wrap long lines in the editor</p>
                      </div>
                      <button
                        onClick={() => updatePrefs({ wordWrap: !prefs.wordWrap })}
                        className={`relative w-10 h-6 rounded-full transition-colors ${prefs.wordWrap ? 'bg-indigo-600' : 'bg-gray-700'}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${prefs.wordWrap ? 'translate-x-4' : ''}`} />
                      </button>
                    </div>

                    {/* Preview */}
                    <div className="border-t border-gray-800/60 pt-4">
                      <p className="text-xs text-gray-500 mb-2">Preview</p>
                      <div
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300"
                        style={{ fontFamily: `'${prefs.font}', monospace`, fontSize: `${prefs.fontSize}px` }}
                      >
                        <span className="text-indigo-400">function</span>{' '}
                        <span className="text-yellow-300">greet</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-orange-300">name</span>
                        <span className="text-gray-400">) {'{'}</span>
                        <br />
                        {'  '}
                        <span className="text-purple-400">return</span>{' '}
                        <span className="text-green-400">{'`Hello, ${name}`'}</span>
                        <span className="text-gray-400">;</span>
                        <br />
                        <span className="text-gray-400">{'}'}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ── Connected Apps ── */}
            {activeSection === 'connected-apps' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h2 className="font-semibold">Connected Apps</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage third-party integrations</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-800/60">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">GitHub</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {githubLoading ? 'Checking…' : githubConnected
                            ? <span className="text-green-400">Connected as <span className="font-medium">@{githubUsername}</span></span>
                            : 'Push translated code to your repositories'}
                        </p>
                      </div>
                    </div>
                    <div>
                      {githubLoading
                        ? <div className="w-24 h-8 bg-gray-800 rounded-lg animate-pulse"/>
                        : githubConnected
                          ? <button onClick={handleGithubDisconnect} disabled={githubDisconnecting}
                              className="px-3 py-1.5 text-xs border border-gray-700 hover:border-red-500/50 hover:text-red-400 text-gray-400 rounded-lg transition disabled:opacity-50">
                              {githubDisconnecting ? 'Disconnecting…' : 'Disconnect'}
                            </button>
                          : <button
                              onClick={async () => { try { const d = await api<{url:string}>('/github/connect'); window.location.href = d.url; } catch { showMessage('error','Failed to start GitHub connection'); } }}
                              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white rounded-lg transition inline-flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                              Connect GitHub
                            </button>
                      }
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Push translated code and tool outputs directly to any of your GitHub repositories.</p>
                </div>
              </div>
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
