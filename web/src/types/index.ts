export interface User {
  id: string;
  email: string;
  verified: boolean;
  plan: 'FREE' | 'PRO';
  credits: number;
  monthlyCount?: number;
  githubUsername?: string | null;
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
  createdAt: string;
}

export interface TranslationResponse {
  translatedCode: string;
  credits: number;
  monthlyCount: number;
  freeLimit: number;
}

export interface TranslationStatsResponse {
  plan: string;
  credits: number;
  monthlyCount: number;
  freeLimit: number;
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
