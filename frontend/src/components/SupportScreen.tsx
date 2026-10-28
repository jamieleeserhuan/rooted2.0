/**
 * SupportScreen.tsx
 * -----------------
 * Displays curated NGOs / settlement orgs for the user's selected province.
 * Includes an LGBTQ+ friendly filter toggle.
 */
import { useState } from 'react';
import { ExternalLink, Phone, Mail, Globe } from 'lucide-react';
import { ScreenHeader, Eyebrow, btnGold, btnQuiet, fill } from './ui';
import { translations } from '../data/translations';
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
    <span className="inline-flex items-center rounded-md border border-line px-2 py-0.5 text-[0.75rem] font-medium text-sage-dark">
      {label}
    </span>
  );
}

function NGOCard({ ngo, t }: { ngo: NGO; t: Record<string, string> }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-paper p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1.5 min-w-0">
          <h2 className="m-0 text-[1.375rem] leading-[1.2] font-semibold text-forest">{ngo.name}</h2>
          {ngo.lgbtqFriendly && (
            <span className="self-start rounded-md bg-forest px-2 py-0.5 text-[0.75rem] font-semibold text-cream">
              {t.lgbtqBadge}
            </span>
          )}
        </div>
        <a
          href={ngo.website}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] text-[0.875rem] font-medium text-forest underline underline-offset-4 decoration-sage"
        >
          <Globe aria-hidden="true" className="w-4 h-4" />
          <span>{t.website}</span>
          <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
        </a>
      </div>

      {(ngo.phone || ngo.email) && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[0.875rem] text-forest-deep">
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

      <p className="m-0 text-[0.875rem] leading-[1.5] text-forest-deep">
        <span className="font-semibold">{t.languagesLabel}</span>
        {ngo.languages.join(' · ')}
      </p>

      {ngo.notes && (
        <p className="m-0 rounded-xl bg-cream px-3 py-2 text-[0.875rem] leading-[1.5] text-forest-deep">
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
  const t = translations[currentLanguage];

  return (
    <div className="mx-auto w-full max-w-[820px] px-5 sm:px-8 py-10 sm:py-14 rooted-in">
      <ScreenHeader title={t.supportTitle} onBack={onBack} backLabel={t.backToPathway}>
        <Eyebrow className="block mt-3">{fill(t.supportInProvince, { province: provinceName })}</Eyebrow>
      </ScreenHeader>

      <p className="mt-6 mb-0 max-w-[620px] text-[1.0625rem] leading-[1.6] text-forest-deep">
        {t.supportIntro}
      </p>

      {/* LGBTQ+ filter */}
      <button
        type="button"
        role="switch"
        aria-checked={lgbtqOnly}
        onClick={() => setLgbtqOnly((v) => !v)}
        className="mt-6 w-full flex items-center justify-between gap-4 min-h-[56px] px-4 rounded-xl bg-cream text-[0.9375rem] font-medium text-forest-deep text-start cursor-pointer"
      >
        <span>{t.lgbtqToggle}</span>
        <span className={`shrink-0 w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${lgbtqOnly ? 'bg-forest' : 'bg-line'}`}>
          <span className={`w-5 h-5 rounded-full bg-paper shadow transition-transform ${lgbtqOnly ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
        </span>
      </button>

      {/* Organizations */}
      {ngos.length > 0 ? (
        <ul className="mt-6 list-none p-0 m-0 flex flex-col gap-4 text-start">
          {ngos.map((ngo) => <NGOCard key={ngo.id} ngo={ngo} t={t} />)}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border-[1.5px] border-line bg-paper p-8 text-center flex flex-col gap-2">
          <p className="m-0 text-[1rem] text-forest-deep">
            {fill(lgbtqOnly ? t.noLgbtqOrgs : t.noOrgs, { province: provinceName })}
          </p>
          <p className="m-0 text-[0.875rem] text-forest-deep">
            {fill(t.trySearchingBefore, { province: provinceName })}{' '}
            <a
              href="https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/new-life-canada/settlement-services.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-forest underline underline-offset-4 decoration-sage"
            >
              {t.irccLink}
            </a>.
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onBack} className={`${btnQuiet} flex-1`}>
          {t.backToPathway}
        </button>
        <button type="button" onClick={onReset} className={`${btnGold} flex-1`}>
          {t.startNewSearch}
        </button>
      </div>
    </div>
  );
}
