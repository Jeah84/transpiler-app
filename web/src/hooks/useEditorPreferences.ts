import { useState } from 'react';

export type EditorFont = 'JetBrains Mono' | 'Fira Code' | 'Monaco' | 'Consolas' | 'Courier New';
export type EditorFontSize = 12 | 13 | 14 | 16 | 18;
export type EditorCursor = 'block' | 'line' | 'underline';

export interface EditorPreferences {
  font: EditorFont;
  fontSize: EditorFontSize;
  cursor: EditorCursor;
  lineNumbers: boolean;
  wordWrap: boolean;
}

export const EDITOR_FONTS: { value: EditorFont; label: string; proOnly: boolean }[] = [
  { value: 'JetBrains Mono', label: 'JetBrains Mono',  proOnly: false },
  { value: 'Fira Code',      label: 'Fira Code',        proOnly: false },
  { value: 'Monaco',         label: 'Monaco',           proOnly: true  },
  { value: 'Consolas',       label: 'Consolas',         proOnly: true  },
  { value: 'Courier New',    label: 'Courier New',      proOnly: true  },
];

export const EDITOR_SIZES: EditorFontSize[] = [12, 13, 14, 16, 18];

const DEFAULT_PREFS: EditorPreferences = {
  font: 'JetBrains Mono',
  fontSize: 14,
  cursor: 'line',
  lineNumbers: false,
  wordWrap: false,
};

function load(): EditorPreferences {
  try {
    const stored = localStorage.getItem('editor-prefs');
    if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_PREFS;
}

function save(prefs: EditorPreferences) {
  localStorage.setItem('editor-prefs', JSON.stringify(prefs));
}

export function useEditorPreferences() {
  const [prefs, setPrefs] = useState<EditorPreferences>(load);

  const update = (partial: Partial<EditorPreferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...partial };
      save(next);
      return next;
    });
  };

  return { prefs, update };
}
