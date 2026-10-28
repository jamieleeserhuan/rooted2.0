/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import MentalHealthModal from './MentalHealthModal';
import { DISTRESS_KEYWORDS } from '../data/mentalHealthResources';
import { Language, UserInput } from '../types';
import { translations } from '../data/translations';
import { ScreenHeader, Eyebrow, btnGold, fieldBase } from './ui';

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
      <div className="mx-auto w-full max-w-[720px] px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex flex-col items-center gap-7 text-center rooted-fade" role="status" aria-live="polite">
          <h2 className="m-0 text-[clamp(30px,4vw,44px)] leading-[1.1] font-semibold text-forest">
            Finding your path...
          </h2>

          <div className="relative w-full max-w-[280px] h-1.5 bg-cream rounded-full overflow-hidden" aria-hidden="true">
            <div className="absolute h-full w-1/3 bg-forest rounded-full rooted-loading-bar" />
          </div>

          <p key={quoteIndex} className="m-0 max-w-md min-h-[3rem] font-serif italic text-[20px] leading-[1.4] text-forest rooted-fade">
            "{NEW_BEGINNINGS_QUOTES[quoteIndex]}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 sm:px-8 py-10 sm:py-14 rooted-in">
      <ScreenHeader title={t.descYourWorkTitle} onBack={onBack} backLabel={t.backButton} />

      {/* Privacy notice */}
      <div className="mt-8 flex gap-3 items-start rounded-xl bg-cream px-4 py-4">
        <ShieldCheck aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5 text-forest" />
        <div className="flex flex-col gap-1">
          <Eyebrow><bdi>Your Privacy Matters</bdi></Eyebrow>
          <p className="m-0 text-[15px] leading-[1.55] text-forest-deep">{t.privacyAboveCTA}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8 text-start">
        {/* Description */}
        <div className="flex flex-col gap-3">
          <label htmlFor="description" dir="auto" className="text-[15px] font-medium leading-[1.5] text-forest-deep">
            Type in any language. The more detail, the better your matches:
          </label>
          <textarea
            id="description"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.textareaPlaceholder}
            className={`${fieldBase} min-h-[180px] py-4 leading-[1.6] resize-y placeholder:text-sage-dark/70`}
            required
            disabled={isLoading}
          />

          {/* Example */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[14px] text-sage-dark">{t.examplePillsLabel}</span>
            {examples.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectExample(example.description)}
                className="min-h-[40px] px-4 rounded-full border border-line bg-paper text-[14px] font-medium text-forest hover:bg-cream transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {example.text}
              </button>
            ))}
          </div>
        </div>

        {/* Province + Documents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="province" className="text-[15px] font-medium leading-[1.4] text-forest-deep">
              {t.selectProvinceLabel}
            </label>
            <select
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className={`${fieldBase} min-h-[52px] cursor-pointer`}
              disabled={isLoading}
            >
              {provinces.map((prov) => (
                <option key={prov.code} value={prov.code}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="documentsAvailable" className="text-[15px] font-medium leading-[1.4] text-forest-deep">
              {t.selectDocsLabel}
            </label>
            <select
              id="documentsAvailable"
              value={documentsAvailable}
              onChange={(e) => setDocumentsAvailable(e.target.value as 'none' | 'some' | 'full')}
              className={`${fieldBase} min-h-[52px] cursor-pointer`}
              disabled={isLoading}
            >
              <option value="none">{t.docNone}</option>
              <option value="some">{t.docSome}</option>
              <option value="full">{t.docFull}</option>
            </select>
          </div>
        </div>

        {/* Optional needs */}
        <div className="flex flex-col border-t border-line">
          <label htmlFor="needsChildcare" className="flex gap-3.5 items-start py-4 border-b border-line cursor-pointer">
            <input
              id="needsChildcare"
              type="checkbox"
              checked={needsChildcare}
              onChange={(e) => setNeedsChildcare(e.target.checked)}
              className="w-5 h-5 mt-0.5 shrink-0 accent-forest cursor-pointer"
              disabled={isLoading}
            />
            <span dir="auto" className="text-[15px] leading-[1.5] text-forest-deep">
              Do you need childcare support? We will include childcare resources alongside your pathway.
            </span>
          </label>
          <label htmlFor="isTransOrGenderDiverse" className="flex gap-3.5 items-start py-4 border-b border-line cursor-pointer">
            <input
              id="isTransOrGenderDiverse"
              type="checkbox"
              checked={isTransOrGenderDiverse}
              onChange={(e) => setIsTransOrGenderDiverse(e.target.checked)}
              className="w-5 h-5 mt-0.5 shrink-0 accent-forest cursor-pointer"
              disabled={isLoading}
            />
            <span className="text-[15px] leading-[1.5] text-forest-deep">{t.isTransLabel}</span>
          </label>
        </div>

        {/* Submit */}
        <button
          id="submit-button"
          type="submit"
          className={`${btnGold} w-full`}
          disabled={isLoading || !description.trim()}
        >
          {t.findMyMatches}
        </button>
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
