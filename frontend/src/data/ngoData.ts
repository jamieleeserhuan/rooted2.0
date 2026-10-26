/**
 * ngoData.ts
 * ----------
 * Hardcoded NGO data per Canadian province.
 *
 * STRUCTURE NOTE: This is intentionally shaped to match a future API response.
 * To swap in a live endpoint, replace getNGOsByProvince with a fetch call:
 *   const res = await fetch(`/api/ngos?province=${province}`);
 *   return res.json() as NGO[];
 */

export interface NGO {
  id: string;
  name: string;
  province: string;
  website: string;
  phone?: string;
  email?: string;
  services: string[];
  languages: string[];
  notes?: string;
  lgbtqFriendly?: boolean;
}

const NGO_DATA: NGO[] = [
  // Ontario
  {
    id: 'on-acces-employment',
    lgbtqFriendly: true,
    name: 'ACCES Employment',
    province: 'ON',
    website: 'https://accesemployment.ca',
    phone: '416-921-1800',
    email: 'info@accesemployment.ca',
    services: ['Credential recognition', 'Job placement', 'Bridging programs', 'Mentorship'],
    languages: ['English', 'French', 'Arabic', 'Mandarin', 'Punjabi'],
  },
  {
    id: 'on-costi',
    name: 'COSTI Immigrant Services',
    province: 'ON',
    website: 'https://www.costi.org',
    phone: '416-658-1600',
    services: ['Settlement support', 'Employment counselling', 'Language training', 'Legal aid referrals'],
    languages: ['English', 'Italian', 'Spanish', 'Portuguese', 'Tagalog'],
  },

  {
    id: 'on-settlement-org',
    name: 'Settlement.Org (OCASI)',
    province: 'ON',
    website: 'https://settlement.org',
    services: ['Credential recognition info', 'Settlement navigation', 'Legal rights info'],
    languages: ['English', 'French', 'Arabic', 'Chinese', 'Tagalog', 'Urdu'],
  },
  // British Columbia
  {
    id: 'bc-mosaic',
    lgbtqFriendly: true,
    name: 'MOSAIC',
    province: 'BC',
    website: 'https://www.mosaicbc.org',
    phone: '604-254-9626',
    email: 'info@mosaicbc.org',
    services: ['Settlement services', 'Employment programs', 'Credential recognition', 'Language training'],
    languages: ['English', 'Cantonese', 'Mandarin', 'Spanish', 'Tagalog', 'Punjabi'],
  },
  {
    id: 'bc-issbc',
    lgbtqFriendly: true,
    name: 'Immigrant Services Society of BC (ISSofBC)',
    province: 'BC',
    website: 'https://issbc.org',
    phone: '604-684-2561',
    services: ['Refugee settlement', 'Employment counselling', 'Mental health support', 'Housing'],
    languages: ['English', 'Arabic', 'Dari', 'Farsi', 'French', 'Spanish'],
  },
  {
    id: 'bc-pic',
    name: 'Progressive Intercultural Community Services (PICS)',
    province: 'BC',
    website: 'https://www.pics.bc.ca',
    phone: '604-596-7722',
    services: ['Settlement support', 'Employment services', 'Credential counselling'],
    languages: ['English', 'Punjabi', 'Hindi', 'Urdu'],
  },
  // Alberta
  {
    id: 'ab-ecn',
    name: 'Edmonton Centre for Newcomers',
    province: 'AB',
    website: 'https://www.ecn.ab.ca',
    phone: '780-474-8445',
    email: 'info@ecn.ab.ca',
    services: ['Settlement navigation', 'Employment support', 'Credential assessment help', 'Language training'],
    languages: ['English', 'Arabic', 'Somali', 'French', 'Tigrinya'],
  },
  {
    id: 'ab-isc',
    name: 'Immigrant Services Calgary',
    province: 'AB',
    website: 'https://www.immigrantservicescalgary.ca',
    phone: '403-265-1120',
    services: ['Settlement support', 'Job search', 'Credential recognition guidance', 'Community programs'],
    languages: ['English', 'French', 'Spanish', 'Arabic', 'Tagalog'],
  },
  // Quebec
  {
    id: 'qc-agir',
    lgbtqFriendly: true,
    name: "AGIR — Action des groupes d'intérêt pour les réfugiés",
    province: 'QC',
    website: 'https://agirmontreal.org',
    phone: '514-279-4225',
    services: ['Refugee integration', 'Credential navigation', 'Legal aid referrals', 'Social support'],
    languages: ['French', 'English', 'Arabic', 'Spanish', 'Haitian Creole'],
    notes: "Focused on Quebec's distinct regulatory context including OIIAQ and OEQ.",
  },
  {
    id: 'qc-tcri',
    name: 'Table de concertation des organismes au service des personnes réfugiées et immigrantes (TCRI)',
    province: 'QC',
    website: 'https://tcri.qc.ca',
    phone: '514-272-6060',
    services: ['Refugee rights', 'Settlement coordination', 'Legal support', 'Community advocacy'],
    languages: ['French', 'English', 'Arabic', 'Spanish'],
  },
  // Manitoba
  {
    id: 'mb-ircom',
    lgbtqFriendly: true,
    name: 'Immigrant and Refugee Community Organization of Manitoba (IRCOM)',
    province: 'MB',
    website: 'https://ircom.ca',
    phone: '204-949-4110',
    email: 'info@ircom.ca',
    services: ['Transitional housing', 'Settlement support', 'Employment programs', 'Children & youth services'],
    languages: ['English', 'French', 'Arabic', 'Somali', 'Tigrinya', 'Filipino'],
  },
  // Saskatchewan
  {
    id: 'sk-open-door',
    name: 'Open Door Society (Regina)',
    province: 'SK',
    website: 'https://www.opendoorsociety.org',
    phone: '306-352-3500',
    services: ['Settlement support', 'Employment services', 'Credential counselling', 'Language training'],
    languages: ['English', 'Arabic', 'French', 'Tagalog'],
  },
  // Nova Scotia
  {
    id: 'ns-isans',
    lgbtqFriendly: true,
    name: 'Immigrant Services Association of Nova Scotia (ISANS)',
    province: 'NS',
    website: 'https://isans.ca',
    phone: '902-423-3607',
    email: 'info@isans.ca',
    services: ['Settlement services', 'Employment support', 'Credential recognition', 'Language training'],
    languages: ['English', 'French', 'Arabic', 'Mandarin', 'Spanish'],
  },
  // New Brunswick
  {
    id: 'nb-mcaf',
    name: 'Multicultural Association of Fredericton (MCAF)',
    province: 'NB',
    website: 'https://mcaf.nb.ca',
    phone: '506-457-4038',
    services: ['Settlement support', 'Employment programs', 'Credential guidance'],
    languages: ['English', 'French', 'Arabic'],
  },
  // Newfoundland
  {
    id: 'nl-anc',
    name: 'Association for New Canadians (ANC)',
    province: 'NL',
    website: 'https://ancnl.ca',
    phone: '709-722-9680',
    email: 'info@ancnl.ca',
    services: ['Settlement services', 'Employment counselling', 'Language training', 'Community programs'],
    languages: ['English', 'French', 'Arabic', 'Spanish'],
  },
  // Prince Edward Island
  {
    id: 'pe-irsa',
    name: 'Immigrant & Refugee Services Association PEI (IRSA)',
    province: 'PE',
    website: 'https://irsapei.ca',
    phone: '902-628-6009',
    services: ['Settlement support', 'Employment services', 'Credential counselling'],
    languages: ['English', 'French', 'Arabic'],
  },
];

export function getNGOsByProvince(provinceCode: string): NGO[] {
  return NGO_DATA.filter((ngo) => ngo.province === provinceCode);
}

export default NGO_DATA;
