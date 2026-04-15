import React, { useState, useMemo } from 'react';

const flagOptions = [
  { label: 'g', desc: 'Global' },
  { label: 'i', desc: 'Ignore Case' },
  { label: 'm', desc: 'Multiline' },
  { label: 's', desc: 'Dotall' },
];

function highlightMatches(text: string, regex: RegExp): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const r = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  r.lastIndex = 0;
  while ((match = r.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (start > lastIndex) result.push(text.slice(lastIndex, start));
    result.push(<span key={start} className="bg-indigo-700 text-white rounded px-1">{text.slice(start, end)}</span>);
    lastIndex = end;
    if (match[0].length === 0) r.lastIndex++;
  }
  if (lastIndex < text.length) result.push(text.slice(lastIndex));
  return result;
}

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState<{ [k: string]: boolean }>({ g: true, i: false, m: false, s: false });
  const [testString, setTestString] = useState('');
  const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');

  const { regex, matches, error } = useMemo(() => {
    if (!pattern) return { regex: null, matches: [], groups: [], error: null };
    try {
      const r = new RegExp(pattern, flagStr);
      const matches: RegExpExecArray[] = [];
      const groups: string[][] = [];
      if (testString) {
        const g = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g');
        let m: RegExpExecArray | null;
        while ((m = g.exec(testString)) !== null) {
          matches.push(m);
          if (m.length > 1) groups.push(m.slice(1));
          if (m[0].length === 0) g.lastIndex++;
        }
      }
      return { regex: r, matches, groups, error: null };
    } catch (e: unknown) {
      return { regex: null, matches: [], groups: [], error: e instanceof Error ? e.message : 'Invalid regex' };
    }
  }, [pattern, flagStr, testString]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-indigo-400">Regex Tester</h2>
      <div className="mb-4">
        <label className="block text-gray-400 mb-1">Pattern</label>
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          value={pattern}
          onChange={e => setPattern(e.target.value)}
          placeholder="Enter regex pattern"
        />
        <div className="flex gap-4 mt-2">
          {flagOptions.map(opt => (
            <label key={opt.label} className="flex items-center gap-1 text-gray-400 cursor-pointer">
              <input type="checkbox" checked={!!flags[opt.label]} onChange={() => setFlags(f => ({ ...f, [opt.label]: !f[opt.label] }))} />
              <span>{opt.label}</span>
              <span className="text-xs text-gray-500">({opt.desc})</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 mb-1">Test String</label>
        <textarea
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 min-h-[100px]"
          value={testString}
          onChange={e => setTestString(e.target.value)}
          placeholder="Enter test string"
        />
      </div>
      {error && <div className="text-red-400 mb-2">Regex error: {error}</div>}
      {pattern && testString && !error && (
        <>
          <div className="mb-2 text-gray-400">
            <span className="font-semibold text-indigo-400">Matches:</span> {matches.length}
          </div>
          <div className="bg-gray-800 rounded p-3 mb-2 text-white whitespace-pre-wrap font-mono text-sm">
            {regex ? highlightMatches(testString, regex) : testString}
          </div>
        </>
      )}
    </div>
  );
};

export default RegexTester;
