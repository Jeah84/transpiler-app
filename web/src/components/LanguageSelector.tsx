import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../types';

interface Props {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  label: string;
}

export function LanguageSelector({ value, onChange, label }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SupportedLanguage)}
        className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
}
