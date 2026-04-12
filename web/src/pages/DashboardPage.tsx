import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';
import { CodeEditor } from '../components/CodeEditor';
import { LanguageSelector } from '../components/LanguageSelector';
import { TranslationHistory } from '../components/TranslationHistory';
import type { SupportedLanguage, Translation, TranslationResponse, TranslationHistoryResponse } from '../types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sourceCode, setSourceCode] = useState('');
  const [translatedCode, setTranslatedCode] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>('Python');
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('JavaScript');
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [dailyCount, setDailyCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [history, setHistory] = useState<Translation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
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
      setDailyCount(data.dailyCount);
      setDailyLimit(data.dailyLimit);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {dailyCount}/{dailyLimit} today
            </span>
            {user?.plan === 'FREE' && (
              <Link to="/pricing" className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded">
                Upgrade
              </Link>
            )}
            <Link to="/settings" className="text-gray-400 hover:text-white text-sm">
              Settings
            </Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
              Logout
            </button>
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
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
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

        {/* History panel */}
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
