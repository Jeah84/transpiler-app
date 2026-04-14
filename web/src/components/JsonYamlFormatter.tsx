import React, { useState } from 'react';
import yaml from 'js-yaml';

const INDENTS = [
  { label: '2 Spaces', value: 2 },
  { label: '4 Spaces', value: 4 },
  { label: 'Tabs', value: '\t' },
];

type Mode = 'json' | 'yaml' | 'convert';

type Status = { type: 'success' | 'error' | 'info'; message: string };


function formatJson(input: string, indent: number | string) {
  const resolvedIndent = indent === "\t" ? 2 : Number(indent);
  return JSON.stringify(JSON.parse(input), null, resolvedIndent);
}

function minifyJson(input: string) {
  return JSON.stringify(JSON.parse(input));
}


function formatYaml(input: string, indent: number | string) {
  const obj = yaml.load(input);
  const resolvedIndent = indent === "\t" ? 2 : Number(indent);
  return yaml.dump(obj, { indent: resolvedIndent });
}

function minifyYaml(input: string) {
  const obj = yaml.load(input);
  return yaml.dump(obj, { indent: 2, flowLevel: -1 });
}

export const JsonYamlFormatter: React.FC = () => {
  const [mode, setMode] = useState<Mode>('json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<number | string>(2);
  const [status, setStatus] = useState<Status>({ type: 'info', message: 'Idle' });

  const handleFormat = () => {
    try {
      let result = '';
      const resolvedIndent = indent === "\t" ? 2 : Number(indent);
      if (mode === 'json') result = formatJson(input, indent);
      else if (mode === 'yaml') result = formatYaml(input, indent);
      else if (mode === 'convert') {
        // Try JSON to YAML first, else YAML to JSON
        try {
          const obj = JSON.parse(input);
          result = yaml.dump(obj, { indent: resolvedIndent });
        } catch {
          const obj = yaml.load(input);
          result = JSON.stringify(obj, null, resolvedIndent);
        }
      }
      setOutput(result);
      setStatus({ type: 'success', message: 'Formatted successfully' });
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message });
    }
  };

  const handleMinify = () => {
    try {
      let result = '';
      if (mode === 'json') result = minifyJson(input);
      else if (mode === 'yaml') result = minifyYaml(input);
      else if (mode === 'convert') {
        try {
          const obj = JSON.parse(input);
          result = yaml.dump(obj, { indent: 2, flowLevel: -1 });
        } catch {
          const obj = yaml.load(input);
          result = JSON.stringify(obj);
        }
      }
      setOutput(result);
      setStatus({ type: 'success', message: 'Minified successfully' });
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setStatus({ type: 'info', message: 'Copied to clipboard' });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex border-b mb-2">
        {['json', 'yaml', 'convert'].map((m) => (
          <button
            key={m}
            className={`px-4 py-2 font-semibold border-b-2 ${mode === m ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'}`}
            onClick={() => setMode(m as Mode)}
          >
            {m === 'json' ? 'JSON' : m === 'yaml' ? 'YAML' : 'Convert'}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 px-2">
          <label className="text-sm">Indent:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={indent}
            onChange={e => setIndent(e.target.value === '\\t' ? '\\t' : Number(e.target.value))}
          >
            {INDENTS.map(opt => (
              <option key={opt.label} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="ml-2 px-3 py-1 bg-indigo-500 text-white rounded" onClick={handleFormat}>Format</button>
          <button className="ml-2 px-3 py-1 bg-gray-200 text-gray-700 rounded" onClick={handleMinify}>Minify</button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        <textarea
          className="w-1/2 h-full p-2 border-r resize-none font-mono bg-gray-50 focus:outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={mode === 'yaml' ? 'Paste YAML here...' : 'Paste JSON here...'}
        />
        <div className="w-1/2 h-full flex flex-col">
          <textarea
            className="flex-1 p-2 font-mono bg-white resize-none border-l focus:outline-none"
            value={output}
            readOnly
            placeholder="Output..."
          />
          <div className="flex items-center justify-between p-2 border-t bg-gray-50 text-xs">
            <span className={
              status.type === 'success' ? 'text-green-600' :
              status.type === 'error' ? 'text-red-600' : 'text-gray-500'
            }>
              {status.message}
            </span>
            <button className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded" onClick={handleCopy}>Copy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonYamlFormatter;
