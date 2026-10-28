/**
 * MentalHealthModal.tsx
 * Shown when distress keywords are detected in user input.
 */
import { useState } from 'react';
import { Phone, ExternalLink, Heart } from 'lucide-react';
import { Modal, Eyebrow, btnForest, btnQuiet, fill } from './ui';
import { NATIONAL_RESOURCES, PROVINCE_RESOURCES, MentalHealthResource } from '../data/mentalHealthResources';
import { Language } from '../types';
import { translations } from '../data/translations';

interface MentalHealthModalProps {
  currentLanguage: Language;
  province: string;
  onContinue: () => void;
  onClose: () => void;
}

function ResourceCard({ resource }: { resource: MentalHealthResource }) {
  return (
    <li className="flex flex-col gap-1 rounded-xl bg-paper border border-line px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-[0.9375rem] font-semibold text-forest-deep">{resource.name}</p>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${resource.name} website`}
          className="shrink-0 -m-2 p-2 text-forest"
        >
          <ExternalLink aria-hidden="true" className="w-4 h-4" />
        </a>
      </div>
      <p className="m-0 text-[0.875rem] leading-[1.5] text-forest-deep">{resource.description}</p>
      {resource.phone && (
        <a href={`tel:${resource.phone}`} className="self-start inline-flex items-center gap-1.5 min-h-[40px] text-[0.9375rem] font-semibold text-forest">
          <Phone aria-hidden="true" className="w-4 h-4" />
          <span dir="ltr">{resource.phone}</span>
        </a>
      )}
    </li>
  );
}

export default function MentalHealthModal({ currentLanguage, province, onContinue, onClose }: MentalHealthModalProps) {
  const t = translations[currentLanguage];
  const [showAll, setShowAll] = useState(false);
  const provinceData = PROVINCE_RESOURCES.find((p) => p.code === province);
  const otherProvinces = PROVINCE_RESOURCES.filter((p) => p.code !== province);

  return (
    <Modal
      title={t.mhTitle}
      closeLabel={t.closeCTA}
      onClose={onClose}
      icon={<Heart aria-hidden="true" className="w-6 h-6 mt-1 shrink-0 text-forest" />}
      footer={
        <>
          <button type="button" onClick={onContinue} className={`${btnForest} flex-1`}>
            {t.mhContinue}
          </button>
          <button type="button" onClick={onClose} className={`${btnQuiet} flex-1`}>
            {t.closeCTA}
          </button>
        </>
      }
    >
      <p className="-mt-2 mb-4 text-[0.9375rem] text-forest-deep">{t.mhSubtitle}</p>

      <p className="m-0 mb-6 rounded-xl bg-cream px-4 py-3 text-[0.9375rem] leading-[1.6] text-forest-deep">
        {t.mhBody}
      </p>

      <div className="mb-6">
        <Eyebrow className="block mb-3">{t.mhNational}</Eyebrow>
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {NATIONAL_RESOURCES.map((r) => <ResourceCard key={r.name} resource={r} />)}
        </ul>
      </div>

      {provinceData && (
        <div className="mb-6">
          <Eyebrow className="block mb-3">{fill(t.mhInProvince, { province: provinceData.province })}</Eyebrow>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {provinceData.resources.map((r) => <ResourceCard key={r.name} resource={r} />)}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-expanded={showAll}
        className="min-h-[44px] text-[0.9375rem] font-medium text-forest underline underline-offset-4 decoration-sage cursor-pointer"
      >
        {showAll ? t.mhHideOthers : t.mhShowOthers}
      </button>
      {showAll && (
        <div className="mt-4 flex flex-col gap-6">
          {otherProvinces.map((prov) => (
            <div key={prov.code}>
              <Eyebrow className="block mb-2">{prov.province}</Eyebrow>
              <ul className="list-none p-0 m-0 flex flex-col gap-2">
                {prov.resources.map((r) => <ResourceCard key={r.name} resource={r} />)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
