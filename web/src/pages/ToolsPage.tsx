import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { JsonYamlFormatter } from '../components/JsonYamlFormatter';
import RegexTester from '../components/RegexTester';
import CodeReviewer from '../components/CodeReviewer';

const TABS = [
  { key: 'jsonyaml', label: 'JSON / YAML' },
  { key: 'regex', label: 'Regex Tester' },
  { key: 'review', label: 'Code Reviewer' },
];

const ToolsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Read tab from query string
  const getTabFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    return TABS.some(t => t.key === tabParam) ? tabParam! : 'jsonyaml';
  };
  const [tab, setTab] = useState(getTabFromQuery());

  // Update tab if query string changes
  useEffect(() => {
    const handler = () => setTab(getTabFromQuery());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // No early return for FREE users; show the page to all users

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header/NavBar */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">
              Dashboard
            </Link>
            <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded border border-indigo-500">Tools</span>
            <Link to="/settings" className="text-gray-400 hover:text-white text-sm">
              Settings
            </Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-800 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${tab === t.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-indigo-300'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {tab === 'jsonyaml' && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <JsonYamlFormatter />
            </div>
          )}
          {tab === 'regex' && (
            <RegexTester />
          )}
          {tab === 'review' && (
            <CodeReviewer />
          )}
        </div>

        {/* Overlay for FREE users */}
        {user?.plan === 'FREE' && (
          <div className="absolute inset-0 bg-gray-950/90 flex flex-col items-center justify-center rounded-lg border-4 border-indigo-700 z-10">
            <h2 className="text-2xl font-bold text-indigo-400 mb-2">Upgrade to Pro</h2>
            <p className="text-gray-300 mb-4">Unlock developer tools like Regex Tester and AI Code Reviewer by upgrading your plan.</p>
            <Link to="/pricing" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded transition mb-2">See Pricing</Link>
            <Link to="/dashboard" className="text-indigo-400 underline">Back to Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;
