/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Coins, AlertCircle, ExternalLink, 
  ShieldAlert, Heart, Users,
  Loader2, Download
} from 'lucide-react';
import { Language, NocMatch, PathwayCard, UserInput } from '../types';
import { translations } from '../data/translations';
import { getPathwayWithFallback } from '../data/curatedPathways';
import { fetchPathway } from '../api/pathway';

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
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_text: userInput.description,
          detected_language: pdfLanguage,
          province: pathway.province,
          jobs: [mapNocMatchToJobModel(match)],
          pathway_text: buildPathwayText(pathway, match.title, match.nocCode),
        }),
      });

      if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`);
      }

      const blob = await res.blob();
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

  const statusColors = {
    ready: { text: 'text-[#3B6651] bg-[#EAF3EE] border-[#C2DEC3]/40', dot: 'bg-[#233e00]' },
    pending: { text: 'text-[#865E26] bg-[#FAF4EB] border-[#F3E2C9]/40', dot: 'bg-[#A08E79]' },
    info: { text: 'text-[#34627C] bg-[#E8F1F5] border-[#CCE2F0]/40', dot: 'bg-sky-500' }
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoadingPathway || !pathway) {
    return (
      <div className="w-full max-w-3xl bg-white border border-[#E9E5DE] rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(90,125,108,0.1)] mx-auto flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#233e00] animate-spin" />
        <p className="text-[#2A2A28] text-sm font-semibold">Generating your pathway...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl bg-white border border-[#E9E5DE] rounded-[40px] p-5 md:p-10 shadow-[0_32px_64px_-16px_rgba(90,125,108,0.1)] mx-auto space-y-8">
      {/* Header with back */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F1EDEA] pb-6 text-left">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#F7F5F0] rounded-xl transition text-[#2A2A28] cursor-pointer"
            title={t.backButton}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-[#2A2A28] tracking-tight leading-tight">
              {match.title}
            </h2>
            <p className="text-xs font-bold text-[#2A2A28] uppercase tracking-widest block mt-1.5">
              {pathway.province} — NOC {match.nocCode}
            </p>
            
            {match.nocUrl && (
              <a
              href={match.nocUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#233e00] hover:text-[#192d00] hover:underline transition mt-1.5"
            >
              <span>View open jobs on Job Bank</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-85" />
            </a>
          )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          {/* PDF language selector */}
          <div className="flex flex-col gap-1 self-start md:self-center">
            <select
              value={pdfLanguage}
              onChange={(e) => setPdfLanguage(e.target.value)}
              className="text-xs bg-[#F7F5F0] border border-[#E9E5DE] rounded-xl px-3 py-2 text-[#2A2A28] font-semibold cursor-pointer outline-none focus:border-[#233e00]"
            >
              <option value="eng_Latn">English</option>
              <option value="fra_Latn">Slovak</option>
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
              <option value="som_Latn">Somali</option>            </select>
          </div>          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#233e00] hover:bg-[#192d00] rounded-xl transition cursor-pointer disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Export error notice */}
      {exportError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs font-semibold text-red-700 text-left">
          ⚠ {exportError}
        </div>
      )}

      {/* Fallback notice */}
      {usingFallback && (
        <div className="bg-[#FAF4EB] border border-[#F3E2C9]/60 rounded-xl p-3 text-xs font-semibold text-[#865E26] text-left">
          ⚠ Showing general guidance — could not reach the pathway generator.
        </div>
      )}

      {/* Side-by-Side Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="bg-white border border-[#E9E5DE] rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-[#EAF3EE] rounded-xl text-[#3B6651] border border-[#C2DEC3]/40 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-[#2A2A28] uppercase tracking-widest mb-0.5">{t.estTime}</h4>
            <p className="text-base font-bold text-[#343432]">{pathway.typicalTime}</p>
          </div>
        </div>

        <div className="bg-white border border-[#E9E5DE] rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-[#FAF4EB] rounded-xl text-[#865E26] border border-[#F3E2C9]/40 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-[#2A2A28] uppercase tracking-widest mb-0.5">{t.estCost}</h4>
            <p className="text-base font-bold text-[#343432]">{pathway.typicalCost}</p>
          </div>
        </div>
      </div>


      {/* Step by Step Roadmap */}
      <div className="space-y-6 text-left">
        <h3 className="text-lg font-bold font-serif text-[#2A2A28] tracking-tight border-b border-[#F1EDEA] pb-2">
          Your Step-by-Step Licensing Map
        </h3>

        <div className="relative border-l-2 border-[#E9E5DE] pl-6 ml-4 space-y-8">
          {pathway.steps.map((step) => {
            const color = statusColors[step.status] || statusColors.info;
            return (
              <div key={step.id} className="relative group p-1">
                {/* Visual Connector Dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-[#A08E79] group-hover:bg-[#233e00] transition shadow-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>

                <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                  <h4 className="text-base font-bold font-serif text-[#2A2A28] leading-snug">
                    Step {step.id}: {step.title}
                  </h4>

                  {/* Status Indicator (Text + Color combo mandatory requirement) */}
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider border uppercase flex items-center gap-1.5 ${color.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                    {step.statusText}
                  </span>
                </div>

                <p className="text-[#2A2A28] text-sm leading-relaxed mb-3 max-w-2xl">
                  {step.description}
                </p>
                {step.actionLabel && step.actionUrl && (
                    <a
                    href={step.actionUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#233e00] hover:text-[#192d00] hover:underline transition"
                  >
                    <span>{step.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-85" />
                  </a>
                )}

              </div>
            );
          })}
        </div>
      </div>

        {/* Financial Support Available */}
        <div className="bg-[#F1EDEA] border border-[#E9E5DE] rounded-2xl p-6 text-left">
          <div className="flex items-center gap-2.5 mb-3">
            <Coins className="w-5 h-5 text-[#233e00]" />
            <h3 className="text-sm font-bold text-[#2A2A28] uppercase tracking-wider">
              {t.fundingEarly}
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs md:text-sm text-[#2A2A28] leading-relaxed list-disc list-inside">
            {pathway.fundingOptions.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>
        </div>

      {/* Trans-inclusive guidance mismatches GUIDE (Conditional) */}
      {(userInput.isTransOrGenderDiverse || pathway.nameDiscrepancyGuide) && (
        <div className="bg-[#F3EFF9] border border-[#DDD1ED]/40 rounded-2xl p-6 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-[#5A3886]">
            <Users className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-wider">{t.transGuidanceTitle}</h3>
          </div>
          <p className="text-xs md:text-sm text-[#2A2A28] leading-relaxed">
            Many trans and non-binary refugees encounter significant name mismatches on educational transcripts from their birth countries.
            Canadian human rights frameworks guarantee preferred name processing:
          </p>
          <p className="text-xs font-semibold text-[#5A3886] bg-white border border-[#DDD1ED]/50 p-3 rounded-xl leading-relaxed">
            {pathway.nameDiscrepancyGuide || "Submit a direct statutory declaration of transition alongside any settlement letter to have provincial regulators override database deadnames safely without public history disclosure."}
          </p>
        </div>
      )}


      {/* Find Support CTA */}
        <button
          onClick={onFindSupport}
          className="w-full py-4 px-6 rounded-2xl bg-[#233e00] text-white font-bold text-sm hover:bg-[#192d00] transition cursor-pointer flex items-center justify-center gap-2"
        >
          
          <span>Find Support Organizations Near You</span>
        </button>

        <button
          onClick={onReset}
          className="w-full py-3 px-6 rounded-2xl text-xs font-semibold text-[#7A7A75] bg-[#F7F5F0] hover:bg-[#E9E5DE] border border-[#E9E5DE] hover:border-[#DED9D2] transition cursor-pointer"
        >
          Start New Search
        </button>
    </div>
  );
}