/**
 * SupportScreen.tsx
 * -----------------
 * Displays curated NGOs / settlement orgs for the user's selected province.
 * Includes an LGBTQ+ friendly filter toggle.
 */
import { useState } from 'react';
import { ExternalLink, Phone, Mail, Globe } from 'lucide-react';
import { ScreenHeader, Eyebrow, btnGold, btnQuiet } from './ui';
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

function ServiceTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-line px-2 py-0.5 text-[12px] font-medium text-sage-dark">
      {label}
    </span>
  );
}

function NGOCard({ ngo }: { ngo: NGO }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-paper p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1.5 min-w-0">
          <h2 className="m-0 text-[22px] leading-[1.2] font-semibold text-forest">{ngo.name}</h2>
          {ngo.lgbtqFriendly && (
            <span className="self-start rounded-md bg-forest px-2 py-0.5 text-[12px] font-semibold text-cream">
              LGBTQ+ Friendly
            </span>
          )}
        </div>
        <a
          href={ngo.website}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] text-[14px] font-medium text-forest underline underline-offset-4 decoration-sage"
        >
          <Globe aria-hidden="true" className="w-4 h-4" />
          <span>Website</span>
          <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
        </a>
      </div>

      {(ngo.phone || ngo.email) && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-forest-deep">
          {ngo.phone && (
            <a href={`tel:${ngo.phone}`} className="inline-flex items-center gap-1.5 min-h-[40px] hover:text-forest">
              <Phone aria-hidden="true" className="w-4 h-4 text-sage-dark" />
              <span dir="ltr">{ngo.phone}</span>
            </a>
          )}
          {ngo.email && (
            <a href={`mailto:${ngo.email}`} className="inline-flex items-center gap-1.5 min-h-[40px] break-all hover:text-forest">
              <Mail aria-hidden="true" className="w-4 h-4 shrink-0 text-sage-dark" />
              {ngo.email}
            </a>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {ngo.services.map((s) => <ServiceTag key={s} label={s} />)}
      </div>

      <p className="m-0 text-[14px] leading-[1.5] text-forest-deep">
        <span className="font-semibold">Languages: </span>
        {ngo.languages.join(' · ')}
      </p>

      {ngo.notes && (
        <p className="m-0 rounded-xl bg-cream px-3 py-2 text-[14px] leading-[1.5] text-forest-deep">
          {ngo.notes}
        </p>
      )}
    </li>
  );
}

export default function SupportScreen({ currentLanguage, userInput, onBack, onReset }: SupportScreenProps) {
  const [lgbtqOnly, setLgbtqOnly] = useState(false);
  const allNgos = getNGOsByProvince(userInput.province);
  const ngos = lgbtqOnly ? allNgos.filter((n) => n.lgbtqFriendly) : allNgos;
  const provinceName = PROVINCE_NAMES[userInput.province] ?? userInput.province;
  void currentLanguage;

  return (
    <div className="mx-auto w-full max-w-[820px] px-5 sm:px-8 py-10 sm:py-14 rooted-in">
      <ScreenHeader title="Support Organizations" onBack={onBack} backLabel="Back to My Pathway">
        <Eyebrow className="block mt-3">in {provinceName}</Eyebrow>
      </ScreenHeader>

      <p className="mt-6 mb-0 max-w-[620px] text-[17px] leading-[1.6] text-forest-deep">
        These organizations work directly with newcomers and refugees on credential recognition,
        employment, and settlement. Reach out — they are here to help.
      </p>

      {/* LGBTQ+ filter */}
      <button
        type="button"
        role="switch"
        aria-checked={lgbtqOnly}
        onClick={() => setLgbtqOnly((v) => !v)}
        className="mt-6 w-full flex items-center justify-between gap-4 min-h-[56px] px-4 rounded-xl bg-cream text-[15px] font-medium text-forest-deep text-start cursor-pointer"
      >
        <span>Show LGBTQ+ friendly organizations only</span>
        <span className={`shrink-0 w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${lgbtqOnly ? 'bg-forest' : 'bg-line'}`}>
          <span className={`w-5 h-5 rounded-full bg-paper shadow transition-transform ${lgbtqOnly ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
        </span>
      </button>

      {/* Organizations */}
      {ngos.length > 0 ? (
        <ul className="mt-6 list-none p-0 m-0 flex flex-col gap-4 text-start">
          {ngos.map((ngo) => <NGOCard key={ngo.id} ngo={ngo} />)}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border-[1.5px] border-line bg-paper p-8 text-center flex flex-col gap-2">
          <p className="m-0 text-[16px] text-forest-deep">
            {lgbtqOnly
              ? `No LGBTQ+ specific organizations listed for ${provinceName} yet.`
              : `We don't have specific organizations listed for ${provinceName} yet.`}
          </p>
          <p className="m-0 text-[14px] text-forest-deep">
            Try searching "immigrant settlement services {provinceName}" or visit{' '}
            <a
              href="https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/new-life-canada/settlement-services.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-forest underline underline-offset-4 decoration-sage"
            >
              IRCC's settlement directory
            </a>.
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onBack} className={`${btnQuiet} flex-1`}>
          Back to My Pathway
        </button>
        <button type="button" onClick={onReset} className={`${btnGold} flex-1`}>
          Start New Search
        </button>
      </div>
    </div>
  );
}
