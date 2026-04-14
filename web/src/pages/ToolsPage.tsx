import React, { useState } from 'react';
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
  const [tab, setTab] = useState('jsonyaml');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (user?.plan === 'FREE') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/">
              <Logo />
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded">
                Upgrade
              </Link>
              <Link to="/settings" className="text-gray-400 hover:text-white text-sm">
                Settings
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto mt-16 bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-indigo-400 mb-2">Upgrade to Pro</h2>
          <p className="text-gray-300 mb-4">Unlock developer tools like Regex Tester and AI Code Reviewer by upgrading your plan.</p>
          <Link to="/pricing" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded transition">See Pricing</Link>
        </div>
      </div>
    );
  }

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

      <div className="max-w-4xl mx-auto px-4 py-8">
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
      </div>
    </div>
  );
};

export default ToolsPage;
