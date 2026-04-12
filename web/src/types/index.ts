export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  plan: 'FREE' | 'PRO';
  dailyCount?: number;
  createdAt?: string;
  subscription?: {
    plan: 'FREE' | 'PRO';
    active: boolean;
    currentPeriodEnd: string | null;
  } | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Translation {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceCode: string;
  translatedCode: string;
  tokensUsed: number | null;
  createdAt: string;
}

export interface TranslationResponse {
  id: string;
  translatedCode: string;
  sourceLanguage: string;
  targetLanguage: string;
  tokensUsed: number;
  dailyCount: number;
  dailyLimit: number;
}

export interface TranslationHistoryResponse {
  translations: Translation[];
  total: number;
  page: number;
  limit: number;
}

export const SUPPORTED_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#',
  'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Scala',
  'R', 'Perl', 'Lua', 'Haskell', 'Elixir', 'Clojure', 'F#',
  'MATLAB', 'SQL', 'Bash', 'PowerShell', 'Assembly',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
