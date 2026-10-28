/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AlertCircle, ExternalLink, Loader2, Download } from 'lucide-react';
import { Language, NocMatch, PathwayCard, UserInput } from '../types';
import { translations } from '../data/translations';
import { getPathwayWithFallback } from '../data/curatedPathways';
import { fetchPathway } from '../api/pathway';
import { callSpace } from '../api/space';
import { ScreenHeader, Eyebrow, btnGold, btnForest, btnQuiet, fieldBase } from './ui';

interface PathwayScreenProps {
  currentLanguage: Language;
  match: NocMatch;
  userInput: UserInput;
  detectedLanguage?: string;
  onBack: () => void;
  onReset: () => void;
  onFindSupport: () => void;
}

// ---------------------------------------------------------------------------
// Display types — only the fields PathwayScreen actually renders
// ---------------------------------------------------------------------------

type StepStatus = 'ready' | 'pending' | 'info';

interface DisplayStep {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  statusText: string;
  actionLabel?: string;
  actionUrl?: string;
}

interface DisplayPathway {
  province: string;
  typicalTime: string;
  typicalCost: string;
  fundingOptions: string[];
  steps: DisplayStep[];
}

// Step tags are stored in English (they also go into the PDF, which the
// backend translates). On screen they are shown in the chosen language.
const STATUS_TRANSLATION_KEYS: Record<string, string> = {
  'Credential assessment': 'statusAssessment',
  'Alternative path for missing documents': 'statusNoDocs',
  'Language requirement': 'statusLanguage',
  'Fee required': 'statusFee',
};

const FLAG_STATUS_MAP: Record<string, { status: StepStatus; statusText: string }> = {
  assessment: { status: 'info', statusText: 'Credential assessment' },
  no_docs: { status: 'info', statusText: 'Alternative path for missing documents' },
  english_test: { status: 'ready', statusText: 'Language requirement' },
  fee: { status: 'pending', statusText: 'Fee required' },
};

function mapPathwayCardToDisplay(card: PathwayCard, fallbackProvince: string): DisplayPathway {
  const timeRange =
    card.estimated_time_months_min === card.estimated_time_months_max
      ? `${card.estimated_time_months_min} months`
      : `${card.estimated_time_months_min} - ${card.estimated_time_months_max} months`;

  const costText =
    card.typical_cost_cad > 0
      ? `$${card.typical_cost_cad.toLocaleString()} CAD${card.cost_note ? ` (${card.cost_note})` : ''}`
      : card.cost_note || 'Cost varies';

  return {
    province: card.province || fallbackProvince,
    typicalTime: timeRange,
    typicalCost: costText,
    // No funding note from the backend means no funding box (never sample text).
    fundingOptions: card.funding_note ? [card.funding_note] : [],
    steps: card.steps.map((step) => {
      const flagInfo = step.flag
        ? FLAG_STATUS_MAP[step.flag] || { status: 'info' as StepStatus, statusText: 'Step' }
        : { status: 'info' as StepStatus, statusText: 'Step' };
      return {
        id: step.number,
        title: step.heading,
        description: step.description,
        status: flagInfo.status,
        statusText: flagInfo.statusText,
      };
    }),
  };
}

function mapFallbackToDisplay(fallback: ReturnType<typeof getPathwayWithFallback>): DisplayPathway {
  return {
    province: fallback.province,
    typicalTime: fallback.typicalTime,
    typicalCost: fallback.typicalCost,
    fundingOptions: fallback.fundingOptions,
    steps: fallback.steps.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      status: s.status,
      statusText: s.statusText,
      actionLabel: s.actionLabel,
      actionUrl: s.actionUrl,
    })),
  };
}

// ---------------------------------------------------------------------------
// Export helpers — convert frontend data into the shapes /export-pdf expects
// ---------------------------------------------------------------------------

function mapNocMatchToJobModel(match: NocMatch, rank: number = 1) {
  const matchLabel =
    match.confidence >= 90 ? 'Direct match'
    : match.confidence >= 65 ? 'Related field'
    : 'Transferable skills';

  return {
    rank,
    noc_code: match.nocCode,
    job_title: match.title,
    job_description: match.description,
    full_job_description: match.definition || match.description,
    match_label: matchLabel,
    noc_url: match.nocUrl || `https://www.jobbank.gc.ca/jobsearch/jobsearch?fn21=${match.nocCode}`,
  };
}

function buildPathwayText(pathway: DisplayPathway, occupationTitle: string, nocCode: string): string {
  const lines: string[] = [];
  lines.push(`${occupationTitle} (NOC ${nocCode})`);
  lines.push(`Province: ${pathway.province}`);
  lines.push(`Estimated time: ${pathway.typicalTime}`);
  lines.push(`Typical cost: ${pathway.typicalCost}`);
  lines.push('');
  if (pathway.fundingOptions.length) {
    lines.push('Funding options:');
    pathway.fundingOptions.forEach((opt) => lines.push(`- ${opt}`));
    lines.push('');
  }
  lines.push('Step-by-step pathway:');
  pathway.steps.forEach((step) => {
    lines.push(`Step ${step.id}: ${step.title} (${step.statusText})`);
    lines.push(step.description);
    lines.push('');
  });
  return lines.join('\n');
}

export default function PathwayScreen({ currentLanguage, match, userInput, detectedLanguage, onBack, onReset, onFindSupport }: PathwayScreenProps) {
  const t = translations[currentLanguage];

  // Pathway data state
  const [pathway, setPathway] = useState<DisplayPathway | null>(null);
  const [isLoadingPathway, setIsLoadingPathway] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingPathway(true);
    setUsingFallback(false);

      fetchPathway(match, userInput.province, userInput.documentsAvailable)
      .then((card) => {
        if (!isMounted) return;
        setPathway(mapPathwayCardToDisplay(card, userInput.province));
      })
      .catch((err) => {
        console.error('fetchPathway failed, using fallback data:', err);
        if (!isMounted) return;
        const fallback = getPathwayWithFallback(
          match.nocCode,
          userInput.province,
          userInput.documentsAvailable,
          match.title
        );
        setPathway(mapFallbackToDisplay(fallback));
        setUsingFallback(true);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPathway(false);
      });

    return () => {
      isMounted = false;
    };
  }, [match.nocCode]);

  // Export PDF state
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [pdfLanguage, setPdfLanguage] = useState(detectedLanguage || "auto");
  const handleExportPdf = async () => {
    if (!pathway) return;
    setIsExporting(true);
    setExportError('');
    try {
      // The Space returns the PDF as base64 text so it is never written to
      // the server's file cache.
      const pdfBase64 = await callSpace<string>('/export_pdf', {
        user_text: userInput.description,
        detected_language: pdfLanguage,
        province: pathway.province,
        jobs: [mapNocMatchToJobModel(match)],
        pathway_text: buildPathwayText(pathway, match.title, match.nocCode),
      });

      const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rooted-pathway.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError(err.message || t.exportError);
    } finally {
      setIsExporting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoadingPathway || !pathway) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-5 py-24 flex flex-col items-center gap-4 text-center" role="status" aria-live="polite">
        <Loader2 aria-hidden="true" className="w-7 h-7 text-forest animate-spin" />
        <p className="m-0 text-[1rem] font-medium text-forest">{t.generatingPathway}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[820px] px-5 sm:px-8 py-10 sm:py-14 rooted-in">
      <ScreenHeader title={match.title} onBack={onBack} backLabel={t.backButton}>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Eyebrow><bdi>{pathway.province} · NOC {match.nocCode}</bdi></Eyebrow>
          {match.nocUrl && (
            <a
              href={match.nocUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="inline-flex items-center gap-1.5 min-h-[40px] text-[0.875rem] font-medium text-forest underline underline-offset-4 decoration-sage"
            >
              <span>{t.viewJobBank}</span>
              <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </ScreenHeader>

      {/* Download */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
        <label htmlFor="pdf-language" className="sr-only">{t.pdfLanguage}</label>
        <select
          id="pdf-language"
          value={pdfLanguage}
          onChange={(e) => setPdfLanguage(e.target.value)}
          className={`${fieldBase} min-h-[48px] sm:w-auto cursor-pointer`}
        >
          <option value="eng_Latn">English</option>
          <option value="fra_Latn">Français</option>
          <option value="arb_Arab">العربية</option>
          <option value="fas_Arab">فارسی</option>
          <option value="urd_Arab">اردو</option>
          <option value="prs_Arab">دری</option>
          <option value="spa_Latn">Español</option>
          <option value="por_Latn">Português</option>
          <option value="deu_Latn">Deutsch</option>
          <option value="ita_Latn">Italiano</option>
          <option value="tur_Latn">Türkçe</option>
          <option value="ind_Latn">Bahasa Indonesia</option>
          <option value="vie_Latn">Tiếng Việt</option>
          <option value="pol_Latn">Polski</option>
          <option value="tgl_Latn">Tagalog</option>
          <option value="som_Latn">Soomaali</option>
        </select>
        <button type="button" onClick={handleExportPdf} disabled={isExporting} className={btnForest}>
          {isExporting ? (
            <>
              <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
              <span>{t.generatingPdf}</span>
            </>
          ) : (
            <>
              <Download aria-hidden="true" className="w-4 h-4" />
              <span>{t.downloadPdf}</span>
            </>
          )}
        </button>
      </div>

      {/* Notices */}
      {exportError && (
        <p role="alert" className="mt-4 mb-0 flex gap-2 items-start rounded-xl bg-cream px-4 py-3 text-[0.875rem] text-forest-deep">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          {exportError}
        </p>
      )}
      {usingFallback && (
        <p className="mt-4 mb-0 flex gap-2 items-start rounded-xl bg-cream px-4 py-3 text-[0.875rem] text-forest-deep">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          {t.fallbackNotice}
        </p>
      )}

      {/* Time and cost */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
        <div className="flex flex-col gap-1.5 rounded-xl bg-cream px-5 py-4">
          <Eyebrow>{t.estTime}</Eyebrow>
          <span dir="auto" className="font-serif text-[1.5rem] leading-[1.2] font-semibold text-forest">{pathway.typicalTime}</span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-xl bg-cream px-5 py-4">
          <Eyebrow>{t.estCost}</Eyebrow>
          <span dir="auto" className="font-serif text-[1.5rem] leading-[1.2] font-semibold text-forest">{pathway.typicalCost}</span>
        </div>
      </div>

      {/* Steps */}
      <section className="mt-12 text-start">
        <h2 dir="auto" className="m-0 text-[1.75rem] leading-[1.15] font-semibold text-forest">{t.licensingMapTitle}</h2>
        <ol className="mt-6 list-none p-0 m-0 flex flex-col">
          {pathway.steps.map((step, i) => (
            <li key={step.id} className="relative flex gap-4 pb-8">
              {/* Connector line between numbers */}
              {i < pathway.steps.length - 1 && (
                <span aria-hidden="true" className="absolute top-9 bottom-0 start-[15px] w-px bg-line" />
              )}
              <span aria-hidden="true" className="relative z-[1] shrink-0 w-[31px] h-[31px] rounded-full bg-forest text-cream font-mono text-[0.8125rem] flex items-center justify-center">
                {step.id}
              </span>
              <div className="flex flex-col gap-2 min-w-0 pt-0.5">
                <h3 dir="auto" className="m-0 font-sans text-[1.0625rem] leading-[1.35] font-semibold text-forest-deep">
                  <span className="sr-only">{t.stepWord} {step.id}: </span>{step.title}
                </h3>
                {/* The generic "Step" tag repeats the number, so only real tags show. */}
                {step.statusText !== 'Step' && (
                  <span className="self-start rounded-md border border-line px-2 py-0.5 text-[0.75rem] font-medium text-sage-dark">
                    {t[STATUS_TRANSLATION_KEYS[step.statusText]] ?? step.statusText}
                  </span>
                )}
                <p dir="auto" className="m-0 text-[0.9375rem] leading-[1.6] text-forest-deep">{step.description}</p>
                {step.actionLabel && step.actionUrl && (
                  <a
                    href={step.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="self-start inline-flex items-center gap-1.5 min-h-[40px] text-[0.875rem] font-medium text-forest underline underline-offset-4 decoration-sage"
                  >
                    <span>{step.actionLabel}</span>
                    <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Funding (only when the pathway has real funding information) */}
      {pathway.fundingOptions.length > 0 && (
      <section className="rounded-2xl bg-cream px-6 py-5 text-start">
        <Eyebrow>{t.fundingEarly}</Eyebrow>
        <ul className="mt-3 mb-0 ps-5 flex flex-col gap-2 text-[0.9375rem] leading-[1.6] text-forest-deep list-disc">
          {pathway.fundingOptions.map((opt, i) => (
            <li key={i} dir="auto">{opt}</li>
          ))}
        </ul>
      </section>
      )}

      {/* Next */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onFindSupport} className={`${btnGold} flex-1`}>
          {t.findSupportCTA}
        </button>
        <button type="button" onClick={onReset} className={btnQuiet}>
          {t.startNewSearch}
        </button>
      </div>
    </div>
  );
}
