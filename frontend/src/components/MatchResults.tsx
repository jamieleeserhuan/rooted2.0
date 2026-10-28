/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight } from 'lucide-react';
import { Language, NocMatch } from '../types';
import { translations } from '../data/translations';
import { ScreenHeader, Eyebrow, btnForest, linkUnderline } from './ui';

interface MatchResultsProps {
  currentLanguage: Language;
  matches: NocMatch[];
  onBack: () => void;
  onSelectMatch: (match: NocMatch) => void;
  isSandboxMode?: boolean;
}

export default function MatchResults({ currentLanguage, matches, onBack, onSelectMatch, isSandboxMode }: MatchResultsProps) {
  const t = translations[currentLanguage];

  return (
    <div className="mx-auto w-full max-w-[880px] px-5 sm:px-8 py-10 sm:py-14 rooted-in">
      <ScreenHeader title={t.resultsTitle} onBack={onBack} backLabel={t.backButton} />

      {isSandboxMode && (
        <div className="mt-8 rounded-xl bg-cream px-4 py-4 flex flex-col gap-1.5 text-start">
          <Eyebrow>Simulated Sandbox Active</Eyebrow>
          <p className="m-0 text-[0.875rem] leading-[1.55] text-forest-deep">
            Because no <code className="font-mono text-[0.8125rem] px-1 rounded bg-paper border border-line">GEMINI_API_KEY</code> has been set up in Settings, Rooted is running in simulated sandbox mode. Tracing completed with our local semantic matcher and mock pathways. To unlock dynamic translation & custom drafting, configure your API secret.
          </p>
        </div>
      )}

      {/* Matches */}
      <ol className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0 text-start">
        {matches.map((match, idx) => (
          <li
            key={idx}
            className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-paper p-6 rooted-in"
            style={{ animationDelay: `${idx * 70}ms` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <Eyebrow><bdi>NOC CODE {match.nocCode}</bdi></Eyebrow>
              <span dir="auto" className="text-[0.8125rem] font-medium text-forest">{match.matchLabel}</span>
            </div>

            <h2 dir="auto" className="m-0 text-[1.5rem] leading-[1.15] font-semibold text-forest">{match.title}</h2>
            {match.category && <span className="text-[0.8125rem] text-sage-dark">{match.category}</span>}

            <p dir="auto" className="m-0 text-[0.9375rem] leading-[1.55] text-forest-deep">{match.description}</p>

            <div className="h-1 w-full rounded-full bg-cream overflow-hidden" aria-hidden="true">
              <div className="h-full rounded-full bg-forest" style={{ width: `${match.confidence}%` }} />
            </div>

            <button type="button" onClick={() => onSelectMatch(match)} className={`${btnForest} mt-auto w-full`}>
              {t.selectMatchCTA}
              <ArrowRight aria-hidden="true" className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          </li>
        ))}
      </ol>

      {/* Escape hatch */}
      <div className="mt-10 text-center">
        <button type="button" onClick={onBack} className={`min-h-[48px] text-[0.9375rem] font-medium text-forest ${linkUnderline}`}>
          {t.escapeHatch}
        </button>
      </div>
    </div>
  );
}
