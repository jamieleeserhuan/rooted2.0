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
// Placeholder content for sections not yet covered by the LLM-generated
// pathway card. Clearly marked as sample data — replace with real
// per-province research when available.
// ---------------------------------------------------------------------------

const PLACEHOLDER_FUNDING =
  "Sample data: Newcomer loan programs and provincial bridging bursaries may help cover assessment, exam, and training costs. [Placeholder — replace with verified provincial funding info]";

const PLACEHOLDER_CHILDCARE =
  "Sample data: Many provinces offer child care subsidies for newcomers completing credential assessments or bridging programs. Check with your local settlement agency. [Placeholder — replace with verified provincial childcare support info]";

const PLACEHOLDER_NAME_DISCREPANCY =
  "Sample data: Provincial regulatory bodies generally accept a statutory declaration to address name discrepancies for trans and non-binary applicants. [Placeholder — replace with regulator-specific guidance]";

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
  childcareSupport: string;
  nameDiscrepancyGuide?: string;
}

const FLAG_STATUS_MAP: Record<string, { status: StepStatus; statusText: string }> = {
  assessment: { status: 'info', statusText: 'Credential assessment' },
  no_docs: { status: 'info', statusText: 'Alternative path for missing documents' },
  english_test: { status: 'ready', statusText: 'Language requirement' },
  fee: { status: 'pending', statusText: 'Fee required' },
};

function mapPathwayCardToDisplay(
  card: PathwayCard,
  fallbackProvince: string,
  isTransOrGenderDiverse: boolean
): DisplayPathway {
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
    fundingOptions: [card.funding_note || PLACEHOLDER_FUNDING],
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
    childcareSupport: PLACEHOLDER_CHILDCARE,
    nameDiscrepancyGuide: isTransOrGenderDiverse ? PLACEHOLDER_NAME_DISCREPANCY : undefined,
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
    childcareSupport: fallback.childcareSupport,
    nameDiscrepancyGuide: fallback.nameDiscrepancyGuide,
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
  lines.push('Funding options:');
  pathway.fundingOptions.forEach((opt) => lines.push(`- ${opt}`));
  lines.push('');
  lines.push('Step-by-step pathway:');
  pathway.steps.forEach((step) => {
    lines.push(`Step ${step.id}: ${step.title} (${step.statusText})`);
    lines.push(step.description);
    lines.push('');
  });
  lines.push('Childcare support:');
  lines.push(pathway.childcareSupport);
  if (pathway.nameDiscrepancyGuide) {
    lines.push('');
    lines.push('Name discrepancy guidance:');
    lines.push(pathway.nameDiscrepancyGuide);
  }
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
        setPathway(mapPathwayCardToDisplay(card, userInput.province, userInput.isTransOrGenderDiverse));
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
      setExportError(err.message || 'Could not export PDF.');
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
        <p className="m-0 text-[16px] font-medium text-forest">Generating your pathway...</p>
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
              className="inline-flex items-center gap-1.5 min-h-[40px] text-[14px] font-medium text-forest underline underline-offset-4 decoration-sage"
            >
              <span>View open jobs on Job Bank</span>
              <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </ScreenHeader>

      {/* Download */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
        <label htmlFor="pdf-language" className="sr-only">PDF language</label>
        <select
          id="pdf-language"
          value={pdfLanguage}
          onChange={(e) => setPdfLanguage(e.target.value)}
          className={`${fieldBase} min-h-[48px] sm:w-auto cursor-pointer`}
        >
          <option value="eng_Latn">English</option>
          <option value="fra_Latn">French</option>
          <option value="arb_Arab">Arabic</option>
          <option value="fas_Arab">Persian / Farsi</option>
          <option value="urd_Arab">Urdu</option>
          <option value="prs_Arab">Dari</option>
          <option value="spa_Latn">Spanish</option>
          <option value="por_Latn">Portuguese</option>
          <option value="deu_Latn">German</option>
          <option value="ita_Latn">Italian</option>
          <option value="tur_Latn">Turkish</option>
          <option value="ind_Latn">Indonesian</option>
          <option value="vie_Latn">Vietnamese</option>
          <option value="pol_Latn">Polish</option>
          <option value="tgl_Latn">Tagalog</option>
          <option value="som_Latn">Somali</option>
        </select>
        <button type="button" onClick={handleExportPdf} disabled={isExporting} className={btnForest}>
          {isExporting ? (
            <>
              <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download aria-hidden="true" className="w-4 h-4" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Notices */}
      {exportError && (
        <p role="alert" className="mt-4 mb-0 flex gap-2 items-start rounded-xl bg-cream px-4 py-3 text-[14px] text-forest-deep">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          {exportError}
        </p>
      )}
      {usingFallback && (
        <p className="mt-4 mb-0 flex gap-2 items-start rounded-xl bg-cream px-4 py-3 text-[14px] text-forest-deep">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          Showing general guidance — could not reach the pathway generator.
        </p>
      )}

      {/* Time and cost */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
        <div className="flex flex-col gap-1.5 rounded-xl bg-cream px-5 py-4">
          <Eyebrow>{t.estTime}</Eyebrow>
          <span dir="auto" className="font-serif text-[24px] leading-[1.2] font-semibold text-forest">{pathway.typicalTime}</span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-xl bg-cream px-5 py-4">
          <Eyebrow>{t.estCost}</Eyebrow>
          <span dir="auto" className="font-serif text-[24px] leading-[1.2] font-semibold text-forest">{pathway.typicalCost}</span>
        </div>
      </div>

      {/* Steps */}
      <section className="mt-12 text-start">
        <h2 dir="auto" className="m-0 text-[28px] leading-[1.15] font-semibold text-forest">Your Step-by-Step Licensing Map</h2>
        <ol className="mt-6 list-none p-0 m-0 flex flex-col">
          {pathway.steps.map((step, i) => (
            <li key={step.id} className="relative flex gap-4 pb-8">
              {/* Connector line between numbers */}
              {i < pathway.steps.length - 1 && (
                <span aria-hidden="true" className="absolute top-9 bottom-0 start-[15px] w-px bg-line" />
              )}
              <span aria-hidden="true" className="relative z-[1] shrink-0 w-[31px] h-[31px] rounded-full bg-forest text-cream font-mono text-[13px] flex items-center justify-center">
                {step.id}
              </span>
              <div className="flex flex-col gap-2 min-w-0 pt-0.5">
                <h3 dir="auto" className="m-0 font-sans text-[17px] leading-[1.35] font-semibold text-forest-deep">
                  <span className="sr-only">Step {step.id}: </span>{step.title}
                </h3>
                {/* The generic "Step" tag repeats the number, so only real tags show. */}
                {step.statusText !== 'Step' && (
                  <span className="self-start rounded-md border border-line px-2 py-0.5 text-[12px] font-medium text-sage-dark">
                    {step.statusText}
                  </span>
                )}
                <p dir="auto" className="m-0 text-[15px] leading-[1.6] text-forest-deep">{step.description}</p>
                {step.actionLabel && step.actionUrl && (
                  <a
                    href={step.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="self-start inline-flex items-center gap-1.5 min-h-[40px] text-[14px] font-medium text-forest underline underline-offset-4 decoration-sage"
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

      {/* Funding */}
      <section className="rounded-2xl bg-cream px-6 py-5 text-start">
        <Eyebrow>{t.fundingEarly}</Eyebrow>
        <ul className="mt-3 mb-0 ps-5 flex flex-col gap-2 text-[15px] leading-[1.6] text-forest-deep list-disc">
          {pathway.fundingOptions.map((opt, i) => (
            <li key={i} dir="auto">{opt}</li>
          ))}
        </ul>
      </section>

      {/* Name change and document mismatch guide */}
      {(userInput.isTransOrGenderDiverse || pathway.nameDiscrepancyGuide) && (
        <section className="mt-4 rounded-2xl border-[1.5px] border-line bg-paper px-6 py-5 text-start flex flex-col gap-3">
          <Eyebrow>{t.transGuidanceTitle}</Eyebrow>
          <p className="m-0 text-[15px] leading-[1.6] text-forest-deep">
            Many trans and non-binary refugees encounter significant name mismatches on educational transcripts from their birth countries.
            Canadian human rights frameworks guarantee preferred name processing:
          </p>
          <p className="m-0 rounded-xl bg-cream px-4 py-3 text-[15px] leading-[1.6] font-medium text-forest">
            {pathway.nameDiscrepancyGuide || "Submit a direct statutory declaration of transition alongside any settlement letter to have provincial regulators override database deadnames safely without public history disclosure."}
          </p>
        </section>
      )}

      {/* Next */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onFindSupport} className={`${btnGold} flex-1`}>
          Find Support Organizations Near You
        </button>
        <button type="button" onClick={onReset} className={btnQuiet}>
          Start New Search
        </button>
      </div>
    </div>
  );
}
