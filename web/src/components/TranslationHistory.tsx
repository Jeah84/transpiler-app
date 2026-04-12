import type { Translation } from '../types';

interface Props {
  translations: Translation[];
  onSelect: (t: Translation) => void;
}

export function TranslationHistory({ translations, onSelect }: Props) {
  if (translations.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No translations yet</p>
        <p className="text-sm mt-1">Your translation history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto">
      {translations.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className="w-full text-left p-3 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">
              {t.sourceLanguage} → {t.targetLanguage}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(t.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono truncate">
            {t.sourceCode.slice(0, 80)}
          </p>
        </button>
      ))}
    </div>
  );
}
