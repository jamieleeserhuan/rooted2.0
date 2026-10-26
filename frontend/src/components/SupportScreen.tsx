/**
 * SupportScreen.tsx
 * -----------------
 * Displays curated NGOs / settlement orgs for the user's selected province.
 * Includes an LGBTQ+ friendly filter toggle.
 */
import { useState } from 'react';
import { ArrowLeft, ExternalLink, Phone, Mail, Globe, Heart } from 'lucide-react';
import { Language, UserInput } from '../types';
import { getNGOsByProvince, NGO } from '../data/ngoData';

interface SupportScreenProps {
  currentLanguage: Language;
  userInput: UserInput;
  onBack: () => void;
  onReset: () => void;
}

const PROVINCE_NAMES: Record<string, string> = {
  ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta', QC: 'Quebec',
  MB: 'Manitoba', SK: 'Saskatchewan', NS: 'Nova Scotia', NB: 'New Brunswick',
  NL: 'Newfoundland', PE: 'Prince Edward Island',
};

const SERVICE_COLORS: Record<string, string> = {
  'Credential recognition':          'bg-[#EAF3EE] text-[#3A6B50] border-[#C2DEC3]/60',
  'Credential recognition info':     'bg-[#EAF3EE] text-[#3A6B50] border-[#C2DEC3]/60',
  'Credential assessment help':      'bg-[#EAF3EE] text-[#3A6B50] border-[#C2DEC3]/60',
  'Credential counselling':          'bg-[#EAF3EE] text-[#3A6B50] border-[#C2DEC3]/60',
  'Credential navigation':           'bg-[#EAF3EE] text-[#3A6B50] border-[#C2DEC3]/60',
  'Credential recognition guidance': 'bg-[#EAF3EE] text-[#3A6B50] border-[#C2DEC3]/60',
  'Employment counselling':  'bg-[#EEF3FA] text-[#2E5490] border-[#C2CFDE]/60',
  'Employment programs':     'bg-[#EEF3FA] text-[#2E5490] border-[#C2CFDE]/60',
  'Employment services':     'bg-[#EEF3FA] text-[#2E5490] border-[#C2CFDE]/60',
  'Employment support':      'bg-[#EEF3FA] text-[#2E5490] border-[#C2CFDE]/60',
  'Job placement':           'bg-[#EEF3FA] text-[#2E5490] border-[#C2CFDE]/60',
  'Job search':              'bg-[#EEF3FA] text-[#2E5490] border-[#C2CFDE]/60',
  'Legal aid referrals': 'bg-[#FAF4EB] text-[#865E26] border-[#F3E2C9]/60',
  'Legal support':       'bg-[#FAF4EB] text-[#865E26] border-[#F3E2C9]/60',
  'Legal rights info':   'bg-[#FAF4EB] text-[#865E26] border-[#F3E2C9]/60',
  'Refugee rights':      'bg-[#FAF4EB] text-[#865E26] border-[#F3E2C9]/60',
  'Language training':     'bg-[#F3EFF9] text-[#5A3886] border-[#DDD1ED]/60',
  'Mental health support': 'bg-[#FEF2F2] text-[#9B1C1C] border-[#FECACA]/60',
  'Housing':               'bg-[#FEF2F2] text-[#9B1C1C] border-[#FECACA]/60',
  'Transitional housing':  'bg-[#FEF2F2] text-[#9B1C1C] border-[#FECACA]/60',
};

const DEFAULT_TAG = 'bg-[#F1EDEA] text-[#2A2A28] border-[#E9E5DE]';

function ServiceTag({ label }: { label: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${SERVICE_COLORS[label] ?? DEFAULT_TAG}`}>
      {label}
    </span>
  );
}

function NGOCard({ ngo }: { ngo: NGO }) {
  return (
    <div className="bg-white border border-[#E9E5DE] rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold font-serif text-[#2A2A28] leading-snug">{ngo.name}</h3>
          {ngo.lgbtqFriendly && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FDF4FF] text-[#7C3AED] border border-[#E9D5FF]">
              LGBTQ+ Friendly
            </span>
          )}
        </div>
          <a
          href={ngo.website}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#233e00] hover:text-[#192d00] hover:underline transition"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-[#2A2A28]">
        {ngo.phone && (
          <a href={`tel:${ngo.phone}`} className="flex items-center gap-1 hover:text-[#233e00] transition">
            <Phone className="w-3.5 h-3.5 text-[#2A2A28]" />
            {ngo.phone}
          </a>
        )}
        {ngo.email && (
          <a href={`mailto:${ngo.email}`} className="flex items-center gap-1 hover:text-[#233e00] transition">
            <Mail className="w-3.5 h-3.5 text-[#2A2A28]" />
            {ngo.email}
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ngo.services.map((s) => <ServiceTag key={s} label={s} />)}
      </div>

      <p className="text-[11px] text-[#2A2A28]">
        <span className="font-semibold">Languages: </span>
        {ngo.languages.join(' · ')}
      </p>

      {ngo.notes && (
        <p className="text-[11px] text-[#865E26] bg-[#FAF4EB] border border-[#F3E2C9]/50 rounded-xl px-3 py-2 leading-relaxed">
          {ngo.notes}
        </p>
      )}
    </div>
  );
}

export default function SupportScreen({ currentLanguage, userInput, onBack, onReset }: SupportScreenProps) {
  const [lgbtqOnly, setLgbtqOnly] = useState(false);
  const allNgos = getNGOsByProvince(userInput.province);
  const ngos = lgbtqOnly ? allNgos.filter((n) => n.lgbtqFriendly) : allNgos;
  const provinceName = PROVINCE_NAMES[userInput.province] ?? userInput.province;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-12">

      {/* Header card */}
      <div className="bg-white border border-[#E9E5DE] rounded-[32px] p-6 md:p-8 shadow-[0_32px_64px_-16px_rgba(90,125,108,0.1)]">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#F7F5F0] rounded-xl transition text-[#2A2A28] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-[#2A2A28] tracking-tight leading-tight">
              Support Organizations
            </h2>
            <p className="text-sm text-[#2A2A28] mt-0.5">in {provinceName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-[#EAF3EE] border border-[#C2DEC3]/40 rounded-2xl p-4 mb-4">
          <Heart className="w-5 h-5 text-[#233e00] shrink-0 mt-0.5" />
          <p className="text-sm text-[#2A2A28] leading-relaxed">
            These organizations work directly with newcomers and refugees on credential recognition,
            employment, and settlement. Reach out — they are here to help.
          </p>
        </div>

        {/* LGBTQ+ filter toggle */}
        <button
          onClick={() => setLgbtqOnly((v) => !v)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-semibold transition cursor-pointer ${
            lgbtqOnly
              ? 'bg-[#FDF4FF] border-[#E9D5FF] text-[#7C3AED]'
              : 'bg-[#F7F5F0] border-[#E9E5DE] text-[#2A2A28]'
          }`}
        >
          <span>Show LGBTQ+ friendly organizations only</span>
          <span className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${lgbtqOnly ? 'bg-[#7C3AED]' : 'bg-[#D1D5DB]'}`}>
            <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${lgbtqOnly ? 'translate-x-5' : 'translate-x-0'}`} />
          </span>
        </button>
      </div>

      {/* NGO cards */}
      {ngos.length > 0 ? (
        <div className="space-y-4">
          {ngos.map((ngo) => <NGOCard key={ngo.id} ngo={ngo} />)}
        </div>
      ) : (
        <div className="bg-white border border-[#E9E5DE] rounded-2xl p-8 text-center space-y-2">
          <p className="text-[#2A2A28] text-sm">
            {lgbtqOnly
              ? `No LGBTQ+ specific organizations listed for ${provinceName} yet.`
              : `We don't have specific organizations listed for ${provinceName} yet.`}
          </p>
          <p className="text-xs text-[#2A2A28]">
            Try searching "immigrant settlement services {provinceName}" or visit{' '}
            <a
              href="https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/new-life-canada/settlement-services.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#233e00] hover:underline font-semibold"
            >
              IRCC's settlement directory
            </a>.
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 rounded-2xl border border-[#E9E5DE] text-sm font-semibold text-[#2A2A28] hover:bg-[#F7F5F0] transition cursor-pointer"
        >
          Back to My Pathway
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 px-4 rounded-2xl bg-[#233e00] text-white text-sm font-bold hover:bg-[#192d00] transition cursor-pointer"
        >
          Start New Search
        </button>
      </div>

    </div>
  );
}