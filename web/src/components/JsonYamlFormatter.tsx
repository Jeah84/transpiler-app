import React, { useState } from 'react';
import { load, dump } from 'js-yaml';

type Mode = 'json' | 'yaml' | 'convert';
type Status = { type: 'success' | 'error' | 'info'; message: string };

const INDENTS = [
  { label: '2 Spaces', value: 2 },
  { label: '4 Spaces', value: 4 },
  { label: 'Tab', value: '\t' },
];

function formatJson(input: string, indent: number | string): string {
  const n = indent === '\t' ? '\t' : Number(indent);
  return JSON.stringify(JSON.parse(input), null, n);
}
function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input));
}
function formatYaml(input: string, indent: number | string): string {
  const obj = load(input);
  const n = indent === '\t' ? 2 : Number(indent);
  return dump(obj, { indent: n });
}
function minifyYaml(input: string): string {
  const obj = load(input);
  return dump(obj, { indent: 2, flowLevel: -1 });
}

export const JsonYamlFormatter: React.FC = () => {
  const [mode, setMode] = useState<Mode>('json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<number | string>(2);
  const [status, setStatus] = useState<Status>({ type: 'info', message: 'Idle' });
  const [copied, setCopied] = useState(false);

  const run = (action: 'format' | 'minify' | 'convert') => {
    try {
      let result = '';
      if (action === 'format') {
        result = mode === 'json' ? formatJson(input, indent) : formatYaml(input, indent);
      } else if (action === 'minify') {
        result = mode === 'json' ? minifyJson(input) : minifyYaml(input);
      } else {
        if (mode === 'json') {
          result = dump(JSON.parse(input), { indent: Number(indent) || 2 });
        } else {
          result = JSON.stringify(load(input), null, Number(indent) || 2);
        }
      }
      setOutput(result);
      setStatus({ type: 'success', message: 'Done' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setStatus({ type: 'error', message: msg });
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const statusColor =
    status.type === 'success' ? 'text-green-400' :
    status.type === 'error' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg text-white min-h-screen">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex rounded overflow-hidden border border-gray-600">
          {(['json', 'yaml', 'convert'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-sm ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {m === 'convert' ? (mode === 'json' ? 'JSON→YAML' : 'YAML→JSON') : m.toUpperCase()}
            </button>
          ))}
        </div>
        <select
          value={String(indent)}
          onChange={(e) => setIndent(e.target.value === '\t' ? '\t' : Number(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-gray-300 text-sm rounded px-2 py-1"
        >
          {INDENTS.map((i) => (
            <option key={String(i.value)} value={String(i.value)}>{i.label}</option>
          ))}
        </select>
        <button onClick={() => run('format')} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">Format</button>
        <button onClick={() => run('minify')} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Minify</button>
        <button onClick={() => run('convert')} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm">Convert</button>
        <span className={`text-xs ml-auto ${statusColor}`}>{status.message}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON or YAML here..."
            className="bg-gray-800 border border-gray-600 text-gray-100 font-mono text-sm rounded p-3 resize-none focus:outline-none focus:border-blue-500"
            rows={20}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Output</label>
            <button onClick={handleCopy} disabled={!output} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded text-xs">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="bg-gray-800 border border-gray-600 text-gray-100 font-mono text-sm rounded p-3 resize-none focus:outline-none"
            rows={20}
          />
        </div>
      </div>
    </div>
  );
};

export default JsonYamlFormatter;
