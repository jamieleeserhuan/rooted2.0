/**
 * MentalHealthModal.tsx
 * Shown when distress keywords are detected in user input.
 */
import { useState } from 'react';
import { Phone, ExternalLink, Heart } from 'lucide-react';
import { Modal, Eyebrow, btnForest, btnQuiet } from './ui';
import { NATIONAL_RESOURCES, PROVINCE_RESOURCES, MentalHealthResource } from '../data/mentalHealthResources';

interface MentalHealthModalProps {
  province: string;
  onContinue: () => void;
  onClose: () => void;
}

function ResourceCard({ resource }: { resource: MentalHealthResource }) {
  return (
    <li className="flex flex-col gap-1 rounded-xl bg-paper border border-line px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-[15px] font-semibold text-forest-deep">{resource.name}</p>
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
      <p className="m-0 text-[14px] leading-[1.5] text-forest-deep">{resource.description}</p>
      {resource.phone && (
        <a href={`tel:${resource.phone}`} className="self-start inline-flex items-center gap-1.5 min-h-[40px] text-[15px] font-semibold text-forest">
          <Phone aria-hidden="true" className="w-4 h-4" />
          <span dir="ltr">{resource.phone}</span>
        </a>
      )}
    </li>
  );
}

export default function MentalHealthModal({ province, onContinue, onClose }: MentalHealthModalProps) {
  const [showAll, setShowAll] = useState(false);
  const provinceData = PROVINCE_RESOURCES.find((p) => p.code === province);
  const otherProvinces = PROVINCE_RESOURCES.filter((p) => p.code !== province);

  return (
    <Modal
      title="You don't have to do this alone"
      onClose={onClose}
      icon={<Heart aria-hidden="true" className="w-6 h-6 mt-1 shrink-0 text-forest" />}
      footer={
        <>
          <button type="button" onClick={onContinue} className={`${btnForest} flex-1`}>
            Continue with my pathway
          </button>
          <button type="button" onClick={onClose} className={`${btnQuiet} flex-1`}>
            Close
          </button>
        </>
      }
    >
      <p className="-mt-2 mb-4 text-[15px] text-forest-deep">Free support is available across Canada, right now.</p>

      <p className="m-0 mb-6 rounded-xl bg-cream px-4 py-3 text-[15px] leading-[1.6] text-forest-deep">
        We noticed something in what you wrote that made us want to pause.
        The path to recognition matters — and so do you.
        These resources are free, confidential, and available regardless of your immigration status.
      </p>

      <div className="mb-6">
        <Eyebrow className="block mb-3">Available across all of Canada</Eyebrow>
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {NATIONAL_RESOURCES.map((r) => <ResourceCard key={r.name} resource={r} />)}
        </ul>
      </div>

      {provinceData && (
        <div className="mb-6">
          <Eyebrow className="block mb-3">In {provinceData.province}</Eyebrow>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {provinceData.resources.map((r) => <ResourceCard key={r.name} resource={r} />)}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-expanded={showAll}
        className="min-h-[44px] text-[15px] font-medium text-forest underline underline-offset-4 decoration-sage cursor-pointer"
      >
        {showAll ? 'Hide other provinces' : 'Show resources for other provinces'}
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
