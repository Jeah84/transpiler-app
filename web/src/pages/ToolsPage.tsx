import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { JsonYamlFormatter } from '../components/JsonYamlFormatter';
import RegexTester from '../components/RegexTester';
import CodeReviewer from '../components/CodeReviewer';

const TABS = [
  { key: 'jsonyaml', label: 'JSON / YAML', ext: 'json', mime: 'application/json' },
  { key: 'regex',    label: 'Regex Tester',  ext: 'txt',  mime: 'text/plain'       },
  { key: 'review',   label: 'Code Reviewer', ext: 'md',   mime: 'text/markdown'    },
];

const ToolsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getTabFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    return TABS.some(tab => tab.key === t) ? t! : 'jsonyaml';
  };

  const [tab, setTab] = useState(getTabFromQuery);

  useEffect(() => {
    const handler = () => setTab(getTabFromQuery());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };


  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link>
            <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded border border-indigo-500/40">Tools</span>
            <Link to="/settings" className="text-gray-400 hover:text-white text-sm">Settings</Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 relative">

        {/* Tab bar + Save button */}
        <div className="flex items-center justify-between border-b border-gray-800 mb-6">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-indigo-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>

        {/* Tool content */}
        <div className="min-h-[500px]">
          {tab === 'jsonyaml' && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <JsonYamlFormatter />
            </div>
          )}
          {tab === 'regex' && <RegexTester />}
          {tab === 'review' && <CodeReviewer />}
        </div>

        {/* Overlay for FREE users */}
        {user?.plan === 'FREE' && (
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl border border-indigo-900/50 z-10">
            <div className="text-center max-w-sm px-6">
              <div className="text-4xl mb-3">⚡</div>
              <h2 className="text-xl font-bold text-white mb-2">Pro Feature</h2>
              <p className="text-gray-400 text-sm mb-6">Developer tools — Regex Tester, JSON/YAML Formatter, and AI Code Reviewer — are included with every Pro plan.</p>
              <Link to="/pricing" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition">
                Upgrade to Pro
              </Link>
              <div className="mt-3">
                <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-400">← Back to Dashboard</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;
