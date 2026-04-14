import React, { useState } from 'react';

const LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Go',
  'Rust',
  'Java',
  'C++',
  'C#',
  'PHP',
  'Ruby',
  'Kotlin',
  'Swift',
];

const SYSTEM_PROMPT =
  'You are an expert code reviewer. Review the code for bugs, security issues, performance problems, and style. Format your response with clear sections: Bugs, Security, Performance, Style. Be concise and actionable.';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const CodeReviewer: React.FC = () => {
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReview() {
    setLoading(true);
    setError(null);
    setReview('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Language: ${language}\n\nCode:\n${code}`,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setReview(data.content?.[0]?.text || 'No response.');
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-indigo-400">AI Code Reviewer</h2>
      <div className="mb-4">
        <label className="block text-gray-400 mb-1">Language</label>
        <select
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 mb-1">Code</label>
        <textarea
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 min-h-[120px] font-mono"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Paste your code here..."
        />
      </div>
      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
        onClick={handleReview}
        disabled={loading || !code.trim()}
      >
        {loading ? 'Reviewing...' : 'Review Code'}
      </button>
      {error && <div className="text-red-400 mt-3">Error: {error}</div>}
      {review && (
        <div className="bg-gray-800 rounded p-4 mt-4 text-gray-200 whitespace-pre-wrap border border-gray-700">
          {review}
        </div>
      )}
    </div>
  );
};

export default CodeReviewer;
