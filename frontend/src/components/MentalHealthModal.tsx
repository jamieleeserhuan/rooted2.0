/**
 * MentalHealthModal.tsx
 * Shown when distress keywords are detected in user input.
 */
import { useState } from 'react';
import { X, Phone, ExternalLink, Heart } from 'lucide-react';
import { NATIONAL_RESOURCES, PROVINCE_RESOURCES, MentalHealthResource } from '../data/mentalHealthResources';

interface MentalHealthModalProps {
  province: string;
  onContinue: () => void;
  onClose: () => void;
}

function ResourceCard({ resource }: { resource: MentalHealthResource }) {
  return (
    <div className="bg-[#F7F5F0] rounded-xl p-3 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-[#2A2A28]">{resource.name}</p>
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[#5A7D6C] hover:underline">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <p className="text-xs text-[#2A2A28] leading-relaxed">{resource.description}</p>
      {resource.phone && (
        <a href={`tel:${resource.phone}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#5A7D6C] hover:underline">
          <Phone className="w-3 h-3" />
          {resource.phone}
        </a>
      )}
    </div>
  );
}

export default function MentalHealthModal({ province, onContinue, onClose }: MentalHealthModalProps) {
  const [showAll, setShowAll] = useState(false);
  const provinceData = PROVINCE_RESOURCES.find((p) => p.code === province);
  const otherProvinces = PROVINCE_RESOURCES.filter((p) => p.code !== province);

  return (
    <div className="fixed inset-0 bg-[#343432]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[32px] border border-[#E9E5DE] p-6 md:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EAF3EE] rounded-xl flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-[#5A7D6C]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#2A2A28]">You don't have to do this alone</h2>
              <p className="text-xs text-[#2A2A28] mt-0.5">Free support is available across Canada, right now.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F7F5F0] rounded-lg transition cursor-pointer shrink-0">
            <X className="w-4 h-4 text-[#2A2A28]" />
          </button>
        </div>

        <p className="text-sm text-[#2A2A28] leading-relaxed mb-5 bg-[#EAF3EE] rounded-2xl p-4">
          We noticed something in what you wrote that made us want to pause.
          The path to recognition matters — and so do you.
          These resources are free, confidential, and available regardless of your immigration status.
        </p>

        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A2A28] mb-3">Available across all of Canada</h3>
          <div className="space-y-2">
            {NATIONAL_RESOURCES.map((r) => <ResourceCard key={r.name} resource={r} />)}
          </div>
        </div>

        {provinceData && (
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A2A28] mb-3">In {provinceData.province}</h3>
            <div className="space-y-2">
              {provinceData.resources.map((r) => <ResourceCard key={r.name} resource={r} />)}
            </div>
          </div>
        )}

        <div className="mb-6">
          <button onClick={() => setShowAll((v) => !v)} className="text-xs font-semibold text-[#5A7D6C] hover:underline cursor-pointer">
            {showAll ? 'Hide other provinces' : 'Show resources for other provinces'}
          </button>
          {showAll && (
            <div className="mt-4 space-y-5">
              {otherProvinces.map((prov) => (
                <div key={prov.code}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A2A28] mb-2">{prov.province}</h3>
                  <div className="space-y-2">
                    {prov.resources.map((r) => <ResourceCard key={r.name} resource={r} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onContinue} className="flex-1 py-3 px-4 rounded-2xl bg-[#5A7D6C] text-white text-sm font-bold hover:bg-[#4d6b5c] transition cursor-pointer">
            Continue with my pathway
          </button>
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl border border-[#E9E5DE] text-sm font-semibold text-[#2A2A28] hover:bg-[#F7F5F0] transition cursor-pointer">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
