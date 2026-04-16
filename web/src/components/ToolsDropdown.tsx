import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TOOLS = [
  { key: 'jsonyaml', label: 'JSON / YAML Formatter', icon: '{ }' },
  { key: 'regex',    label: 'Regex Tester',          icon: '.*' },
  { key: 'review',   label: 'Code Reviewer',          icon: '✦'  },
];

export function ToolsDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  // Small delay so the cursor can move from button into the dropdown
  // without it flickering closed
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 80);
  };

  const go = (tab: string) => {
    setOpen(false);
    navigate(`/tools?tab=${tab}`);
  };

  const isPro = user?.plan === 'PRO';

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {/* Trigger button — hover area is exactly the size of this element */}
      <button
        type="button"
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors px-1 py-0.5 rounded"
      >
        Tools
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Invisible bridge so the cursor can travel from button to panel */}
          <div className="absolute -top-1 left-0 right-0 h-1" />

          {!isPro && (
            <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-1.5">
              <span className="text-xs text-amber-400 font-medium">⚡ Pro required</span>
            </div>
          )}

          {TOOLS.map(tool => (
            <button
              key={tool.key}
              type="button"
              onClick={() => go(tool.key)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors text-left group"
            >
              <span className="font-mono text-xs text-gray-500 group-hover:text-indigo-200 w-5 text-center shrink-0">
                {tool.icon}
              </span>
              {tool.label}
              {!isPro && (
                <span className="ml-auto text-xs text-gray-600 group-hover:text-indigo-300">🔒</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
