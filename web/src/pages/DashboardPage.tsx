import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';
import { CodeEditor } from '../components/CodeEditor';
import { LanguageSelector } from '../components/LanguageSelector';
import { TranslationHistory } from '../components/TranslationHistory';
import { ToolsDropdown } from '../components/ToolsDropdown';
import { GitHubPushModal } from '../components/GitHubPushModal';
import { useEditorPreferences } from '../hooks/useEditorPreferences';
import type { SupportedLanguage, Translation, TranslationHistoryResponse, TranslationStatsResponse } from '../types';

interface TranslationResponse {
  translatedCode: string;
  detectedLanguage?: string;
  credits: number;
  monthlyCount: number;
  freeLimit: number;
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { prefs } = useEditorPreferences();

  const [sourceCode, setSourceCode] = useState('');
  const [translatedCode, setTranslatedCode] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('JavaScript');
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [freeLimit, setFreeLimit] = useState(10);
  const [history, setHistory] = useState<Translation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api<TranslationStatsResponse>('/translate/stats');
      setCredits(data.credits);
      setMonthlyCount(data.monthlyCount);
      setFreeLimit(data.freeLimit);
    } catch { /* silently fail */ }
  };

  const loadHistory = async () => {
    try {
      const data = await api<TranslationHistoryResponse>('/translate/history?limit=20');
      setHistory(data.translations);
    } catch { /* silently fail */ }
  };

  const handleTranslate = async () => {
    if (!sourceCode.trim()) return;
    setError('');
    setDetectedLanguage(null);
    setTranslating(true);
    setTranslatedCode('');

    try {
      const data = await api<TranslationResponse>('/translate', {
        method: 'POST',
        body: { sourceCode, sourceLanguage: 'auto', targetLanguage },
      });
      setTranslatedCode(data.translatedCode);
      if (data.detectedLanguage) setDetectedLanguage(data.detectedLanguage);
      setCredits(data.credits);
      setMonthlyCount(data.monthlyCount);
      setFreeLimit(data.freeLimit);
      loadHistory();
    } catch (err: any) {
      if (err?.message?.includes('no_credits')) {
        setError("You've used all your free translations this month.");
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
    setTargetLanguage(t.targetLanguage as SupportedLanguage);
    setShowHistory(false);
    setDetectedLanguage(t.sourceLanguage);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const getUsageDisplay = () => {
    if (user?.plan === 'PRO') return { label: 'Unlimited', color: 'text-indigo-400' };
    if (credits > 0) return { label: `${credits} credit${credits !== 1 ? 's' : ''}`, color: credits < 20 ? 'text-amber-400' : 'text-gray-400' };
    const remaining = Math.max(0, freeLimit - monthlyCount);
    return { label: `${remaining}/${freeLimit} free`, color: remaining <= 3 ? 'text-amber-400' : 'text-gray-400' };
  };

  const usage = getUsageDisplay();
  const showOutOfCredits = error.includes('free translations') || error.includes('no_credits');

  const editorStyle = {
    fontFamily: `'${prefs.font}', monospace`,
    fontSize: `${prefs.fontSize}px`,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
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
            <ToolsDropdown />
            <Link to="/settings" className="text-gray-400 hover:text-white text-sm">Settings</Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Language bar */}
        <div className="flex items-center gap-4 mb-4">
          {/* Source — auto detect */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">From</span>
            <div className="flex items-center gap-2 h-10 px-3 bg-gray-900 border border-gray-700 rounded-lg text-sm">
              <span className="text-gray-500">Auto Detect</span>
              {detectedLanguage && (
                <span className="flex items-center gap-1 text-indigo-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                  {detectedLanguage}
                </span>
              )}
              {!detectedLanguage && translating && (
                <span className="text-gray-600 animate-pulse text-xs">detecting…</span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="mt-5 text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          {/* Target language */}
          <LanguageSelector label="To" value={targetLanguage} onChange={setTargetLanguage} />

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-lg text-sm transition-colors"
            >
              {showHistory ? 'Hide History' : 'History'}
            </button>
            {translatedCode && (
              <button onClick={() => setShowGitHub(true)}
                className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-lg text-sm transition flex items-center gap-1.5 text-gray-300 hover:text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                Push
              </button>
            )}
            <button
              onClick={handleTranslate}
              disabled={translating || !sourceCode.trim()}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              {translating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Translating…
                </>
              ) : 'Translate'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4 flex items-center justify-between">
            <span>{error}</span>
            {showOutOfCredits && (
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Link to="/buy-credits" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded-lg transition">Buy Credits</Link>
                <Link to="/pricing" className="text-indigo-400 hover:text-indigo-300 text-xs underline">Go Pro</Link>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div style={editorStyle}>
            <CodeEditor
              value={sourceCode}
            onChange={setSourceCode}
            language="auto"
            placeholder="Paste your code here — language is detected automatically"
            />
          </div>
          <div style={editorStyle}>
            <CodeEditor
              value={translatedCode}
            readOnly
            language={targetLanguage}
            placeholder="Translated code will appear here…"
            />
          </div>
        </div>

        {showHistory && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Translation History</h3>
            <TranslationHistory translations={history} onSelect={handleSelectHistory} />
          </div>
        )}
      </div>

      <GitHubPushModal
        isOpen={showGitHub}
        onClose={() => setShowGitHub(false)}
        content={translatedCode}
        suggestedFilename={`translated.${targetLanguage.toLowerCase().replace(/[^a-z0-9]/g,'')}`}
        label={`${targetLanguage} translation`}
      />
    </div>
  );
}
