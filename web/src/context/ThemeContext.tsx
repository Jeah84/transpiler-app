import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light' | 'auto';
export type AccentTheme = 'indigo' | 'blue' | 'purple' | 'emerald' | 'rose' | 'amber' | 'midnight' | 'dracula' | 'nord';

export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentTheme;
}

// Accent color definitions — maps accent name to Tailwind/CSS values
export const ACCENT_THEMES: Record<AccentTheme, { label: string; primary: string; bg: string; border: string; proOnly: boolean }> = {
  indigo:   { label: 'Indigo',    primary: '#6366f1', bg: '#1e1b4b', border: '#4f46e5', proOnly: false },
  blue:     { label: 'Ocean',     primary: '#3b82f6', bg: '#1e3a5f', border: '#2563eb', proOnly: false },
  purple:   { label: 'Violet',    primary: '#a855f7', bg: '#2e1065', border: '#9333ea', proOnly: true  },
  emerald:  { label: 'Emerald',   primary: '#10b981', bg: '#022c22', border: '#059669', proOnly: true  },
  rose:     { label: 'Rose',      primary: '#f43f5e', bg: '#4c0519', border: '#e11d48', proOnly: true  },
  amber:    { label: 'Amber',     primary: '#f59e0b', bg: '#451a03', border: '#d97706', proOnly: true  },
  midnight: { label: 'Midnight',  primary: '#818cf8', bg: '#0f0e17', border: '#6366f1', proOnly: true  },
  dracula:  { label: 'Dracula',   primary: '#bd93f9', bg: '#1a0533', border: '#9d7bd8', proOnly: true  },
  nord:     { label: 'Nord',      primary: '#88c0d0', bg: '#0d1117', border: '#5e81ac', proOnly: true  },
};

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentTheme;
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentTheme) => void;
  resolvedMode: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemMode(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    (localStorage.getItem('theme-mode') as ThemeMode) || 'dark'
  );
  const [accent, setAccentState] = useState<AccentTheme>(() =>
    (localStorage.getItem('theme-accent') as AccentTheme) || 'indigo'
  );
  const [systemMode, setSystemMode] = useState<'dark' | 'light'>(getSystemMode);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedMode = mode === 'auto' ? systemMode : mode;

  useEffect(() => {
    const root = document.documentElement;
    // Apply resolved mode
    root.classList.toggle('dark', resolvedMode === 'dark');
    root.classList.toggle('light-mode', resolvedMode === 'light');

    // Apply accent CSS variables
    const a = ACCENT_THEMES[accent];
    root.style.setProperty('--accent-primary', a.primary);
    root.style.setProperty('--accent-bg', a.bg);
    root.style.setProperty('--accent-border', a.border);
  }, [resolvedMode, accent]);

  const setMode = (m: ThemeMode) => {
    localStorage.setItem('theme-mode', m);
    setModeState(m);
  };

  const setAccent = (a: AccentTheme) => {
    localStorage.setItem('theme-accent', a);
    setAccentState(a);
  };

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
