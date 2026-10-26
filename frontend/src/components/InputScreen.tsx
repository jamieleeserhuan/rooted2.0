/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import MentalHealthModal from './MentalHealthModal';
import { DISTRESS_KEYWORDS } from '../data/mentalHealthResources';
import { Language, UserInput } from '../types';
import { translations } from '../data/translations';
// @ts-ignore
import LightRays from './LightRays';

const NEW_BEGINNINGS_QUOTES = [
  "Every root has to start somewhere.",
  "Your experience travels with you.",
  "New ground, same skills.",
  "Finding potential paths for you.",
  "Your story continues in Canada.",
];

interface InputScreenProps {
  currentLanguage: Language;
  onBack: () => void;
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

export default function InputScreen({ currentLanguage, onBack, onSubmit, isLoading }: InputScreenProps) {
  const t = translations[currentLanguage];

  const [description, setDescription] = useState('');
  const [province, setProvince] = useState('ON');
  const [documentsAvailable, setDocumentsAvailable] = useState<'none' | 'some' | 'full'>('none');
  const [isTransOrGenderDiverse, setIsTransOrGenderDiverse] = useState(false);
  const [needsChildcare, setNeedsChildcare] = useState(false);
  const [showMentalHealthModal, setShowMentalHealthModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<{ fn: () => void } | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % NEW_BEGINNINGS_QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const examples = [
    {
      text: "ممرضة سورية (Syrian Nurse, 8 yrs hospital)",
      description: "I was a senior registered nurse for 8 years at the Al-Dunya hospital emergency ward in Aleppo. I oversaw shift schedules, administered medications, and trained junior nurses. Due to conflict, I fled without any professional papers."
    },
    // {
    //   text: "Civil engineer,Somalia  (مهندس مدني)",
    //   description: "I worked as a lead Civil Engineer doing water infrastructure and roadway projects in Somalia. I managed local blueprints, contractor logs, safety audits and held an engineering diploma from Mogadishu University, but have only a photo of it."
    // },
    // {
    //   text: "Enseignante primaire (Primary teacher, DRC)",
    //   description: "I taught primary school mathematics and literacy for 4 years in Bukavu, DRC. I organized syllabus plans and wrote student reports. I fled with full transcripts but no official regulatory certificates."
    // },
    //{
     // text: "داروساز افغان Afghan pharmacist, managed store",
      //description: "I was a licensed pharmacist in Kabul for 6 years, managing a pharmacy, dispensing medications, and advising patients. I fled without my pharmacy license or academic transcripts."
    //},
    //{
      //text: "Queer Malaysian Educator",
      //description: "I was a primary school teacher and educator in Malaysia for 5 years, designing lessons and coordinating class materials. As a queer individual, I faced intense systemic discrimination and threats to my safety. I was forced to flee without official university certificates."
    //}
  ];

  const handleSelectExample = (desc: string) => {
    setDescription(desc);
    if (desc.includes('queer') || desc.includes('Malaysia')) {
      setIsTransOrGenderDiverse(true);
    } else {
      setIsTransOrGenderDiverse(false);
    }
  };

  const provinces = [
    { code: 'ON', name: 'Ontario' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'AB', name: 'Alberta' },
    { code: 'QC', name: 'Quebec' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland' },
    { code: 'PE', name: 'Prince Edward Island' },
  ];

  const checkForDistress = (text: string): boolean => {
    const lower = text.toLowerCase();
    return DISTRESS_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    if (checkForDistress(description)) {
        setPendingSubmit({ fn: () => onSubmit({ description, province, documentsAvailable, isTransOrGenderDiverse }) });
      setShowMentalHealthModal(true);
        return;
      }
      onSubmit({
      description,
      province,
      documentsAvailable,
      isTransOrGenderDiverse
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl bg-white border border-[#E9E5DE] rounded-[40px] p-6 md:p-10 shadow-[0_32px_64px_-16px_rgba(90,125,108,0.1)] mx-auto text-center relative overflow-hidden min-h-[420px] flex flex-col items-center justify-center">
        <style>{`
          @keyframes rooted-loading-slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(350%); }
          }
          @keyframes rooted-fade-in {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .rooted-loading-bar {
            animation: rooted-loading-slide 1.6s ease-in-out infinite;
          }
          .rooted-fade-in {
            animation: rooted-fade-in 0.6s ease-out;
          }
        `}</style>

        <div className="absolute inset-0 z-0 opacity-50">
          <LightRays
            raysOrigin="top-center"
            raysColor="#233e00"
            raysSpeed={1}
            lightSpread={0.7}
            rayLength={1.3}
            followMouse={false}
            mouseInfluence={0}
            noiseAmount={0.05}
            distortion={0.02}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 px-4">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2A2A28] tracking-tight">
            Finding your path...
          </h2>

          <div className="w-full max-w-xs h-2 bg-[#F1EDEA] rounded-full overflow-hidden relative">
            <div className="absolute h-full w-1/3 bg-[#233e00] rounded-full rooted-loading-bar" />
          </div>

          <p key={quoteIndex} className="text-sm md:text-base text-[#2A2A28] italic max-w-md rooted-fade-in min-h-[3rem]">
            "{NEW_BEGINNINGS_QUOTES[quoteIndex]}"
          </p>

          <p className="text-[10px] text-[#A08E79] font-bold uppercase tracking-widest mt-2">
            Your data is end-to-end encrypted and deleted when you are done.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white border border-[#E9E5DE] rounded-[40px] p-6 md:p-10 shadow-[0_32px_64px_-16px_rgba(90,125,108,0.1)] mx-auto">
      {/* Header with Back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#F7F5F0] rounded-xl transition text-[#2A2A28] cursor-pointer"
          title={t.backButton}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold font-serif text-[#2A2A28] tracking-tight">
          {t.descYourWorkTitle}
        </h2>
      </div>

      {/* Privacy Notice */}
      <div className="w-full bg-[#F1EDEA]/90 border border-[#E9E5DE] rounded-[24px] p-4 mb-4 flex gap-3 items-start">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-[#E9E5DE]/40">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#2A2A28]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#2A2A28] uppercase tracking-wider mb-1">Your Privacy Matters</h3>
          <p className="text-xs text-[#2A2A28] leading-relaxed">{t.privacyAboveCTA}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        {/* Description Textarea */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-widest text-[#A08E79] ml-1">
            Type in any language. The more detail, the better your matches:
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.textareaPlaceholder}
            className="w-full h-48 bg-[#FBF9F6] border-2 border-[#F1EDEA] rounded-[24px] p-6 text-base focus:border-[#233e00] focus:ring-0 outline-none resize-y placeholder:text-[#BBB6AE] font-sans text-[#343432] leading-relaxed shadow-xs"
            required
            disabled={isLoading}
          />
        </div>

        {/* Preset Pills */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2A2A28] ml-1">{t.examplePillsLabel}</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectExample(example.description)}
                className="px-4 py-2 bg-[#F7F5F0] hover:bg-[#E9E5DE] rounded-full text-xs font-semibold text-[#343432] border border-transparent hover:border-[#DED9D2] transition cursor-pointer"
                disabled={isLoading}
              >
                {example.text}
              </button>
            ))}
          </div>
        </div>

      {/* Province + Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="province" className="block min-h-[28px] text-[10px] font-bold uppercase tracking-widest text-[#2A2A28] ml-1">
              {/* ← changed: added min-h-[28px] */}
              {t.selectProvinceLabel}
            </label>
            <select
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full bg-[#FBF9F6] border border-[#F1EDEA] rounded-2xl px-4 py-3.5 text-sm focus:border-[#233e00] outline-none text-[#343432] font-semibold cursor-pointer"
              disabled={isLoading}
            >
              {provinces.map((prov) => (
                <option key={prov.code} value={prov.code}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="documentsAvailable" className="block min-h-[28px] text-[10px] font-bold uppercase tracking-widest text-[#2A2A28] ml-1">
              {/* ← changed: added min-h-[28px] */}
              {t.selectDocsLabel}
            </label>
            <select
              id="documentsAvailable"
              value={documentsAvailable}
              onChange={(e) => setDocumentsAvailable(e.target.value as 'none' | 'some' | 'full')}
              className="w-full bg-[#FBF9F6] border border-[#F1EDEA] rounded-2xl px-4 py-3.5 text-sm focus:border-[#233e00] outline-none text-[#343432] font-semibold cursor-pointer"
              disabled={isLoading}
            >
              <option value="none">{t.docNone}</option>
              <option value="some">{t.docSome}</option>
              <option value="full">{t.docFull}</option>
            </select>
          </div>
        </div>

        {/* Childcare support */}
        <div className="bg-[#FAF4EB] border border-[#F3E2C9]/50 rounded-[24px] p-5 flex gap-3.5 items-start">
          <input
            id="needsChildcare"
            type="checkbox"
            checked={needsChildcare}
            onChange={(e) => setNeedsChildcare(e.target.checked)}
            className="w-5 h-5 text-[#233e00] focus:ring-[#233e00] border-[#E9E5DE] rounded cursor-pointer mt-0.5"
            disabled={isLoading}
          />
          <label htmlFor="needsChildcare" className="text-xs md:text-sm text-[#2A2A28] font-semibold cursor-pointer leading-relaxed">
            Do you need childcare support? We will include childcare resources alongside your pathway.
          </label>
        </div>

        {/* Name mismatch / trans-inclusive */}
        <div className="bg-[#F1EDEA] border border-[#E9E5DE] rounded-[24px] p-5 flex gap-3.5 items-start">
          <input
            id="isTransOrGenderDiverse"
            type="checkbox"
            checked={isTransOrGenderDiverse}
            onChange={(e) => setIsTransOrGenderDiverse(e.target.checked)}
            className="w-5 h-5 text-[#233e00] focus:ring-[#233e00] border-[#E9E5DE] rounded cursor-pointer mt-0.5"
            disabled={isLoading}
          />
          <label htmlFor="isTransOrGenderDiverse" className="text-xs md:text-sm text-[#2A2A28] font-semibold cursor-pointer leading-relaxed">
            {t.isTransLabel}
          </label>
        </div>

        {/* Submit */}
        <button
          id="submit-button"
          type="submit"
          className="w-full flex items-center justify-center gap-2.5 px-8 py-5 bg-[#233e00] hover:bg-[#192d00] text-white font-bold rounded-[20px] transition shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] min-h-[48px] disabled:opacity-50 cursor-pointer"
          disabled={isLoading || !description.trim()}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 flex-row justify-center w-full">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Finding your matches...</span>
            </div>
          ) : (
            <>
              <Search className="w-5 h-5 opacity-80" />
              <span>{t.findMyMatches}</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 justify-center text-xs text-[#A08E79] font-bold mt-4">
          <AlertCircle className="w-4 h-4 text-[#A08E79]" />
          <span>We respect your privacy. We do not store any of your information.</span>
        </div>
      </form>
      {showMentalHealthModal && (
        <MentalHealthModal
          province={province}
          onContinue={() => {
            setShowMentalHealthModal(false);
            if (pendingSubmit) pendingSubmit.fn();
          }}
          onClose={() => setShowMentalHealthModal(false)}
        />
        )}
      </div>
    );
}