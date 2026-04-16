import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';
import { CodeEditor } from '../components/CodeEditor';
import { LanguageSelector } from '../components/LanguageSelector';
import { TranslationHistory } from '../components/TranslationHistory';
import type { SupportedLanguage, Translation, TranslationResponse, TranslationHistoryResponse, TranslationStatsResponse } from '../types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sourceCode, setSourceCode] = useState('');
  const [translatedCode, setTranslatedCode] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>('Python');
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('JavaScript');
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [freeLimit, setFreeLimit] = useState(10);
  const [history, setHistory] = useState<Translation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadStats = async () => {
    try {
      const data = await api<TranslationStatsResponse>('/translate/stats');
      setCredits(data.credits);
      setMonthlyCount(data.monthlyCount);
      setFreeLimit(data.freeLimit);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api<TranslationHistoryResponse>('/translate/history?limit=20');
      setHistory(data.translations);
    } catch {
      // silently fail
    }
  };

  const handleTranslate = async () => {
    if (!sourceCode.trim()) return;
    setError('');
    setTranslating(true);
    setTranslatedCode('');

    try {
      const data = await api<TranslationResponse>('/translate', {
        method: 'POST',
        body: { sourceCode, sourceLanguage, targetLanguage },
      });
      setTranslatedCode(data.translatedCode);
      setCredits(data.credits);
      setMonthlyCount(data.monthlyCount);
      setFreeLimit(data.freeLimit);
      loadHistory();
    } catch (err: any) {
      if (err?.message?.includes('no_credits')) {
        setError('You\'ve used all your free translations this month.');
      } else {
        setError(err instanceof Error ? err.message : 'Translation failed');
      }
    } finally {
      setTranslating(false);
    }
  };

  const handleSelectHistory = (t: Translation) => {
    setSourceCode(t.sourceCode);
    setTranslatedCode(t.translatedCode);
    setSourceLanguage(t.sourceLanguage as SupportedLanguage);
    setTargetLanguage(t.targetLanguage as SupportedLanguage);
    setShowHistory(false);
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceCode(translatedCode);
    setTranslatedCode('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUsageDisplay = () => {
    if (user?.plan === 'PRO') return { label: 'Unlimited', color: 'text-indigo-400' };
    if (credits > 0) return { label: `${credits} credit${credits !== 1 ? 's' : ''}`, color: credits < 20 ? 'text-amber-400' : 'text-gray-400' };
    const remaining = Math.max(0, freeLimit - monthlyCount);
    return { label: `${remaining}/${freeLimit} free`, color: remaining <= 3 ? 'text-amber-400' : 'text-gray-400' };
  };

  const usage = getUsageDisplay();
  const showOutOfCredits = error.includes('free translations') || error.includes('no_credits');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${usage.color}`}>{usage.label}</span>
            {user?.plan === 'FREE' && (
              <Link to="/buy-credits" className="text-xs bg-indigo-600/20 border border-indigo-600/40 text-indigo-400 px-3 py-1 rounded-full hover:bg-indigo-600/30 transition">
                Buy Credits
              </Link>
            )}
            {user?.plan === 'FREE' && (
              <Link to="/pricing" className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-700 transition">
                Go Pro
              </Link>
            )}
            <div className="relative group">
              <button className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-1">
                Tools
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l3 3 3-3" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-44 bg-gray-900 border border-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-20">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-800 text-gray-200 text-sm"
                  onClick={() => navigate('/tools?tab=jsonyaml')}
                >JSON / YAML Formatter</button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-800 text-gray-200 text-sm"
                  onClick={() => navigate('/tools?tab=regex')}
                >Regex Tester</button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-800 text-gray-200 text-sm"
                  onClick={() => navigate('/tools?tab=review')}
                >Code Reviewer</button>
              </div>
            </div>
            <Link to="/settings" className="text-gray-400 hover:text-white text-sm">Settings</Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Language selectors */}
        <div className="flex items-end gap-4 mb-4">
          <LanguageSelector label="From" value={sourceLanguage} onChange={setSourceLanguage} />
          <button
            onClick={handleSwapLanguages}
            className="mb-0.5 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Swap languages"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          <LanguageSelector label="To" value={targetLanguage} onChange={setTargetLanguage} />
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-lg text-sm transition-colors"
            >
              {showHistory ? 'Hide History' : 'History'}
            </button>
            <button
              onClick={handleTranslate}
              disabled={translating || !sourceCode.trim() || sourceLanguage === targetLanguage}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-sm transition-colors"
            >
              {translating ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4 flex items-center justify-between">
            <span>{error}</span>
            {showOutOfCredits && (
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Link to="/buy-credits" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded-lg transition">
                  Buy Credits
                </Link>
                <Link to="/pricing" className="text-indigo-400 hover:text-indigo-300 text-xs underline">
                  Go Pro
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CodeEditor
            value={sourceCode}
            onChange={setSourceCode}
            language={sourceLanguage}
            placeholder="Paste your code here..."
          />
          <CodeEditor
            value={translatedCode}
            readOnly
            language={targetLanguage}
            placeholder="Translated code will appear here..."
          />
        </div>

        {showHistory && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Translation History</h3>
            <TranslationHistory translations={history} onSelect={handleSelectHistory} />
          </div>
        )}
      </div>
    </div>
  );
}
