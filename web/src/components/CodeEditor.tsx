interface Props {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  language: string;
}

export function CodeEditor({ value, onChange, readOnly = false, placeholder, language }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 rounded-t-lg">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{language}</span>
        {!readOnly && (
          <span className="text-xs text-gray-500">{value.length} chars</span>
        )}
      </div>
      <textarea
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        className="flex-1 w-full bg-gray-900 text-green-400 font-mono text-sm p-4 resize-none focus:outline-none border border-gray-700 border-t-0 rounded-b-lg placeholder-gray-600 min-h-[300px]"
      />
    </div>
  );
}
