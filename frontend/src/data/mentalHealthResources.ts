/**
 * mentalHealthResources.ts
 * ------------------------
 * Mental health crisis resources by province for Rooted.
 * Shown when distress keywords are detected in user input.
 */

export interface MentalHealthResource {
  name: string;
  description: string;
  phone?: string;
  url: string;
}

export interface ProvinceResources {
  province: string;
  code: string;
  resources: MentalHealthResource[];
}

export const NATIONAL_RESOURCES: MentalHealthResource[] = [
  {
    name: "988 Suicide & Crisis Lifeline",
    description: "Call or text 988 anytime, 24/7. Free, confidential. No health card needed.",
    phone: "988",
    url: "https://988.ca",
  },
  {
    name: "Crisis Services Canada",
    description: "National crisis and suicide prevention line, available 24/7.",
    phone: "1-833-456-4566",
    url: "https://www.crisisservicescanada.ca",
  },
  {
    name: "Kids Help Phone",
    description: "For young people. Call or text HELLO to 686868, available 24/7.",
    phone: "1-800-668-6868",
    url: "https://kidshelpphone.ca",
  },
  {
    name: "Wellness Together Canada",
    description: "Free access to a licensed therapist, government-funded.",
    url: "https://www.wellnesstogether.ca",
  },
  {
    name: "CAMH",
    description: "Canada's largest mental health hospital. Resources for all ages.",
    url: "https://www.camh.ca",
  },
];

export const PROVINCE_RESOURCES: ProvinceResources[] = [
  {
    province: "Ontario",
    code: "ON",
    resources: [
      {
        name: "ConnexOntario",
        description: "Free referrals to mental health, addiction, and crisis services across Ontario.",
        phone: "1-866-531-2600",
        url: "https://www.connexontario.ca",
      },
      {
        name: "Ontario Structured Psychotherapy (OSP)",
        description: "Free CBT therapy for depression and anxiety, publicly funded.",
        url: "https://www.ontariohealth.ca/getting-health-care/mental-health-addictions/depression-anxiety-ontario-structured-psychotherapy",
      },
      {
        name: "BounceBack (CMHA Ontario)",
        description: "Free skill-building program for anxiety and mild to moderate depression.",
        url: "https://cmha.ca/bounce-back",
      },
      {
        name: "Good2Talk",
        description: "Free support for post-secondary students aged 17-25.",
        phone: "1-866-925-5454",
        url: "https://good2talk.ca",
      },
    ],
  },
  {
    province: "British Columbia",
    code: "BC",
    resources: [
      {
        name: "BC Crisis Line",
        description: "Call or text 310-6789 (no area code). Available 24/7.",
        phone: "310-6789",
        url: "https://www.crisiscentre.bc.ca",
      },
      {
        name: "MOSAIC BC",
        description: "Mental health and settlement support specifically for newcomers and refugees.",
        phone: "604-254-9626",
        url: "https://www.mosaicbc.org",
      },
      {
        name: "StrongerBC Mental Health",
        description: "Free mental health resources and referrals for BC residents.",
        url: "https://www.healthlinkbc.ca/mental-health-substance-use",
      },
    ],
  },
  {
    province: "Alberta",
    code: "AB",
    resources: [
      {
        name: "Alberta Mental Health Help Line",
        description: "Free, 24/7 mental health support and referrals.",
        phone: "1-877-303-2642",
        url: "https://www.alberta.ca/mental-health-support.aspx",
      },
      {
        name: "Distress Centre Calgary",
        description: "Crisis support and distress counselling for Albertans.",
        phone: "403-266-4357",
        url: "https://www.distresscentre.com",
      },
      {
        name: "Addiction & Mental Health (Edmonton Zone)",
        description: "AHS mental health and addiction services in Edmonton.",
        phone: "780-424-2424",
        url: "https://www.albertahealthservices.ca/amh/amh.aspx",
      },
    ],
  },
  {
    province: "Quebec",
    code: "QC",
    resources: [
      {
        name: "Tel-Aide Québec",
        description: "Crisis and emotional support line, available 24/7.",
        phone: "514-935-1101",
        url: "https://www.telaide.org",
      },
      {
        name: "AGIR Montréal",
        description: "Refugee integration and social support, including mental health referrals.",
        phone: "514-279-4225",
        url: "https://agirmontreal.org",
      },
      {
        name: "Suicide Action Montréal",
        description: "Crisis intervention and suicide prevention, 24/7.",
        phone: "1-866-APPELLE (277-3553)",
        url: "https://suicideactionmontreal.org",
      },
    ],
  },
  {
    province: "Manitoba",
    code: "MB",
    resources: [
      {
        name: "Klinic Crisis Line",
        description: "Free, confidential crisis support available 24/7.",
        phone: "204-786-8686",
        url: "https://klinic.mb.ca",
      },
      {
        name: "Manitoba Suicide Prevention & Support Line",
        description: "Call 1-877-435-7170, available 24/7.",
        phone: "1-877-435-7170",
        url: "https://www.reasontohope.ca",
      },
    ],
  },
  {
    province: "Saskatchewan",
    code: "SK",
    resources: [
      {
        name: "Saskatchewan Crisis Line",
        description: "Crisis Services Canada covers Saskatchewan, available 24/7.",
        phone: "1-833-456-4566",
        url: "https://www.crisisservicescanada.ca",
      },
      {
        name: "Mobile Crisis Services Regina",
        description: "Crisis support for Regina residents.",
        phone: "306-525-5333",
        url: "https://www.mobilecrisis.ca",
      },
    ],
  },
  {
    province: "Nova Scotia",
    code: "NS",
    resources: [
      {
        name: "NS Mental Health Crisis Line",
        description: "Free, 24/7 mental health crisis support for Nova Scotians.",
        phone: "1-888-429-8167",
        url: "https://www.nshealth.ca/mental-health-crisis",
      },
      {
        name: "ISANS Mental Health Support",
        description: "Immigrant Services Association of NS offers mental health referrals.",
        phone: "902-423-3607",
        url: "https://isans.ca",
      },
    ],
  },
  {
    province: "New Brunswick",
    code: "NB",
    resources: [
      {
        name: "Chimo Helpline",
        description: "24/7 crisis and emotional support for New Brunswickers.",
        phone: "1-800-667-5005",
        url: "https://chimohelpline.ca",
      },
    ],
  },
  {
    province: "Newfoundland",
    code: "NL",
    resources: [
      {
        name: "NL Mental Health Crisis Line",
        description: "Crisis support for Newfoundland and Labrador residents.",
        phone: "1-888-737-4668",
        url: "https://www.easternhealth.ca/FindAService.aspx?id=190",
      },
    ],
  },
  {
    province: "Prince Edward Island",
    code: "PE",
    resources: [
      {
        name: "PEI Mobile Crisis Unit",
        description: "24/7 mental health crisis response for PEI residents.",
        phone: "1-800-218-2885",
        url: "https://www.healthpei.ca/mentalhealth",
      },
    ],
  },
];

// Keywords that may indicate distress — checked client-side before submission
export const DISTRESS_KEYWORDS = [
  // English
  "suicide", "suicidal", "kill myself", "end my life", "want to die",
  "no reason to live", "hopeless", "worthless", "self harm", "self-harm",
  "hurt myself", "cutting", "can't go on", "give up", "no hope",
  "desperate", "overwhelmed", "breaking down", "falling apart",
  "trauma", "ptsd", "flashback", "nightmare", "haunted",
  // French
  "suicide", "me tuer", "mourir", "sans espoir", "désespéré",
  "me faire du mal", "traumatisme",
  // Arabic
  "انتحار", "أقتل نفسي", "لا أريد العيش", "يأس", "صدمة",
  // Dari
  "خودکشی", "بکشم خودم را", "ناامید", "تروما",
];
