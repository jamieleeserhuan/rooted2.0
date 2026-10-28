/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import AsciiField from './AsciiField';
import { Modal, btnGold, btnForest, linkUnderline } from './ui';

interface HomeProps {
  currentLanguage: Language;
  /** Kept for compatibility; the language picker now lives in the header. */
  setLanguage?: (lang: Language) => void;
  onStart: () => void;
}

export default function Home({ currentLanguage, onStart }: HomeProps) {
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const t = translations[currentLanguage];
  const isRtl = currentLanguage === 'ar' || currentLanguage === 'dr';

  const disclosures = [
    { title: t.disclaimerTitle, text: t.disclaimerText },
    { title: t.knowYourRightsTitle, text: t.rightsText },
  ];

  return (
    <section className="on-forest relative overflow-hidden bg-forest text-cream">
      <AsciiField rtl={isRtl} />

      <div className="relative mx-auto max-w-[1120px] px-5 sm:px-10 py-[clamp(56px,11vh,128px)] min-h-[calc(100svh-81px)] flex flex-col justify-center">
        <div className="max-w-[640px] flex flex-col gap-6 rooted-in">
          <h1 className="m-0 text-[clamp(38px,5.4vw,68px)] leading-[1.04] tracking-[-0.015em] font-semibold text-cream text-balance">
            {t.tagline}
          </h1>
          <p className="m-0 max-w-[540px] text-[18px] leading-[1.6] text-cream text-pretty">
            {t.briefExplanation}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-7 gap-y-3">
            <button id="start-button" type="button" onClick={onStart} className={btnGold}>
              {t.startCTA}
            </button>
            <button
              id="how-works-button"
              type="button"
              onClick={() => setShowHowItWorksModal(true)}
              className={`min-h-[48px] text-[16px] font-medium text-cream ${linkUnderline}`}
            >
              {t.howItWorksCTA}
            </button>
          </div>

          {/* Two short notes, folded away until someone wants them. */}
          <div className="mt-8 border-t border-sage/35 max-w-[560px]">
            {disclosures.map((d) => (
              <details key={d.title} className="group border-b border-sage/35">
                <summary className="flex items-center justify-between gap-4 min-h-[56px] cursor-pointer text-[13px] font-medium tracking-[0.14em] rtl:tracking-normal uppercase text-cream">
                  {d.title}
                  <Plus aria-hidden="true" className="w-4 h-4 shrink-0 text-sage transition-transform group-open:rotate-45" />
                </summary>
                <p className="m-0 pb-5 text-[15px] leading-[1.6] text-cream/90">{d.text}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {showHowItWorksModal && (
        <Modal
          title={t.howItWorksTitle}
          closeLabel={t.closeCTA}
          onClose={() => setShowHowItWorksModal(false)}
          footer={
            <button type="button" onClick={() => setShowHowItWorksModal(false)} className={`${btnForest} sm:ms-auto`}>
              {t.closeCTA}
            </button>
          }
        >
          <div className="flex flex-col gap-4 text-[16px] leading-[1.6]">
            <p className="m-0">{t.howItWorksText1}</p>
            <p className="m-0">{t.howItWorksText2}</p>
            <p className="m-0">{t.howItWorksText3}</p>
          </div>
        </Modal>
      )}
    </section>
  );
}
