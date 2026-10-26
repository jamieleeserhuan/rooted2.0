/**
 * src/api/match.ts
 * ----------------
 * All fetch logic for the NOC matching endpoint.
 * Wired to the FastAPI backend (main.py /match endpoint).
 */

import type { NocMatch, MatchApiResponse, Language } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_URL = import.meta.env.VITE_API_URL || '';

// Shape of a single item in the backend's /match response (matcher.py's Job type)
interface BackendJob {
  rank: number;
  noc_code: string;
  job_title: string;
  job_description: string;
  full_job_description: string;
  match_label: string;
  noc_url: string;
}

interface BackendMatchResponse {
  matches: BackendJob[];
  detected_language: string;
}

export async function fetchNocMatches(
  description: string,
  language: Language
): Promise<MatchApiResponse> {
  if (USE_MOCK) {
    await delay(2000);
    return getMockMatches(description);
  }

  const res = await fetch(`${API_URL}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description,
      source_lang: 'auto', // let the backend detect the language
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Match API error: ${res.status}`);
  }

  const data: BackendMatchResponse = await res.json();

  return {
    matches: data.matches.map(mapJobToNocMatch),
    fallbackMode: false,
    detectedLanguage: data.detected_language,
  };
}

// ---------------------------------------------------------------------------
// Mapping helpers — convert backend Job shape to frontend NocMatch shape
// ---------------------------------------------------------------------------

function mapJobToNocMatch(job: BackendJob): NocMatch {
  return {
    nocCode: job.noc_code,
    title: job.job_title,
    description: job.job_description,
    confidence: confidenceFromMatchLabel(job.match_label),
    matchLabel: job.match_label,
    category: categoryFromNocCode(job.noc_code),
    definition: job.full_job_description,
    nocUrl: job.noc_url,
  };
}

function confidenceFromMatchLabel(label: string): number {
  switch (label) {
    case 'Direct match':
      return 90;
    case 'Related field':
      return 65;
    case 'Transferable skills':
      return 40;
    default:
      return 50;
  }
}

const NOC_CATEGORY_MAP: Record<string, string> = {
  '0': 'Management',
  '1': 'Business & Finance',
  '2': 'Sciences & Engineering',
  '3': 'Health',
  '4': 'Education, Law & Community Services',
  '5': 'Arts & Culture',
  '6': 'Sales & Service',
  '7': 'Trades & Transport',
  '8': 'Natural Resources & Agriculture',
  '9': 'Manufacturing & Utilities',
};

function categoryFromNocCode(nocCode: string): string {
  const firstDigit = nocCode.charAt(0);
  return NOC_CATEGORY_MAP[firstDigit] || 'General';
}

// ---------------------------------------------------------------------------
// Mock matches — unchanged, for VITE_USE_MOCK=true dev mode
// ---------------------------------------------------------------------------

function getMockMatches(description: string): MatchApiResponse {
  const lower = description.toLowerCase();

  if (lower.includes('nurse') || lower.includes('hospital') || lower.includes('patient')) {
    return {
      matches: [
        { nocCode: '31301', title: 'Registered Nurse (RN)', description: 'Provide comprehensive nursing care in hospitals and clinical environments.', confidence: 94, matchLabel: 'Direct match', category: 'Healthcare', definition: 'Registered nurses plan and provide nursing care to patients.' },
        { nocCode: '32101', title: 'Licensed Practical Nurse (LPN)', description: 'Provide supportive nursing services under supervision of medical practitioners.', confidence: 78, matchLabel: 'Related field', category: 'Healthcare' },
        { nocCode: '31102', title: 'General Practitioner & Family Physician', description: 'Diagnose and treat illnesses and physiological disorders.', confidence: 61, matchLabel: 'Transferable skills', category: 'Healthcare' },
      ],
      fallbackMode: true,
    };
  }

  if (lower.includes('engineer') || lower.includes('civil') || lower.includes('construction')) {
    return {
      matches: [
        { nocCode: '21300', title: 'Civil Engineer', description: 'Plan, design and oversee construction of infrastructure and structural assets.', confidence: 93, matchLabel: 'Direct match', category: 'Engineering', definition: 'Civil engineers plan, design, develop and manage projects.' },
        { nocCode: '22300', title: 'Civil Engineering Technologist', description: 'Provide technical support in civil design, surveying, and material testing.', confidence: 74, matchLabel: 'Related field', category: 'Engineering' },
        { nocCode: '72010', title: 'Construction Manager', description: 'Direct and coordinate construction crews on building projects.', confidence: 65, matchLabel: 'Related field', category: 'Trades' },
      ],
      fallbackMode: true,
    };
  }

  if (lower.includes('teach') || lower.includes('school') || lower.includes('education')) {
    return {
      matches: [
        { nocCode: '41201', title: 'Elementary and Secondary School Teacher', description: 'Teach academic courses to students following provincial curricula.', confidence: 91, matchLabel: 'Direct match', category: 'Education', definition: 'Teachers instruct students in academic courses.' },
        { nocCode: '42202', title: 'Early Childhood Educator (ECE)', description: 'Plan and deliver developmental programs for young children.', confidence: 72, matchLabel: 'Related field', category: 'Education' },
        { nocCode: '41221', title: 'Education Policy Advisor', description: 'Research and advise on curriculum development and education policy.', confidence: 55, matchLabel: 'Transferable skills', category: 'Education' },
      ],
      fallbackMode: true,
    };
  }

  return {
    matches: [
      { nocCode: '31301', title: 'Registered Nurse (RN)', description: 'Matched based on healthcare and service competencies in your description.', confidence: 82, matchLabel: 'Related field', category: 'Healthcare' },
      { nocCode: '41201', title: 'School Teacher', description: 'Matched based on instructional and coordination skills in your description.', confidence: 74, matchLabel: 'Related field', category: 'Education' },
      { nocCode: '21300', title: 'Civil Engineer', description: 'Matched based on technical and planning skills in your description.', confidence: 65, matchLabel: 'Related field', category: 'Engineering' },
    ],
    fallbackMode: true,
  };
}
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}