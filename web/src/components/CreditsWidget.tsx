// ============================================================
// CreditsWidget.tsx
// Drop this into web/src/components/CreditsWidget.tsx
// Then import and use it in DashboardPage.tsx (see below)
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';

interface CreditsWidgetProps {
  plan: string;
  credits: number;
  monthlyCount: number;
  freeLimit: number;
}

export const CreditsWidget: React.FC<CreditsWidgetProps> = ({
  plan,
  credits,
  monthlyCount,
  freeLimit,
}) => {
  if (plan === 'PRO') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="bg-indigo-600/20 border border-indigo-500 text-indigo-400 px-3 py-1 rounded-full font-semibold text-xs">
          ✓ Pro — Unlimited
        </span>
      </div>
    );
  }

  if (credits > 0) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-400">
          <span className="text-white font-semibold">{credits}</span> credit{credits !== 1 ? 's' : ''} left
        </span>
        {credits < 20 && (
          <Link
            to="/buy-credits"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded-full transition"
          >
            Buy More
          </Link>
        )}
      </div>
    );
  }

  // Free tier
  const remaining = Math.max(0, freeLimit - monthlyCount);
  const isLow = remaining <= 3;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={isLow ? 'text-amber-400' : 'text-gray-400'}>
        <span className={`font-semibold ${isLow ? 'text-amber-300' : 'text-white'}`}>
          {remaining}
        </span>
        /{freeLimit} free this month
      </span>
      <Link
        to="/buy-credits"
        className={`text-xs px-3 py-1 rounded-full transition ${
          remaining === 0
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
      >
        {remaining === 0 ? 'Get Credits' : 'Buy Credits'}
      </Link>
    </div>
  );
};
