// ==============================================================================
// SCHEMATRIX - AI Sahayak (Assistant) Engine
// Provides helpful, source-grounded answers about schemes, eligibility and
// public services. Uses Google Gemini ONLY when GEMINI_API_KEY is configured
// server-side; otherwise runs a clearly-labeled offline demo assistant.
// ==============================================================================

import { DEMO_SCHEMES, DEMO_SERVICES } from './demoData';
import { Scheme, SchemeWithDiscovery, PublicService, PublicOffice, SupportedLanguage } from './types';
import { scoreTextMatch, formatIncomeLimit } from './schemeSearch';

export type SahayakMode = 'live' | 'demo';

export interface SahayakSource {
  label: string;
  url?: string;
}

export interface SahayakReply {
  text: string;
  sources: SahayakSource[];
  mode: SahayakMode;
}

export interface SahayakContext {
  schemes: Scheme[];
  services: PublicService[];
  offices: PublicOffice[];
}

/** How the reply language is chosen. */
export type SahayakReplyMode = 'auto' | SupportedLanguage;

/**
 * Resolve the effective reply language.
 * `auto` = mirror whatever language the user wrote the question in (native
 * script detection), so Hindi/Telugu questions get Hindi/Telugu answers even
 * when the UI language is English.
 */
export function resolveReplyLanguage(
  requested: SahayakReplyMode | undefined,
  message: string
): SupportedLanguage {
  if (requested === 'hi' || requested === 'te' || requested === 'en') {
    return requested;
  }
  return detectLanguage(message);
}

/** Detect the language of a question from its script. Latin text defaults to English. */
export function detectLanguage(text: string): SupportedLanguage {
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  return 'en';
}

const LANGUAGE_GUIDANCE: Record<
  SupportedLanguage,
  { label: string; rule: string }
> = {
  en: {
    label: 'English',
    rule:
      'Write your entire reply in clear, simple English that a rural citizen with basic schooling can understand. Avoid jargon and long sentences.',
  },
  hi: {
    label: 'Hindi',
    rule:
      'Write your entire reply in simple Hindi written in Devanagari script (देवनागरी), using everyday words a rural citizen can understand. Avoid heavy Sanskritised or English-heavy phrasing. Write the full reply in Hindi only — never English prose with a Hindi label.',
  },
  te: {
    label: 'Telugu',
    rule:
      'Write your entire reply in simple Telugu written in Telugu script (తెలుగు), using everyday words a rural citizen can understand. Avoid heavy Sanskritised or English-heavy phrasing. Write the full reply in Telugu only — never English prose with a Telugu label.',
  },
};

const ALL_LANGUAGE_RULES = (Object.keys(LANGUAGE_GUIDANCE) as SupportedLanguage[])
  .map((code) => `- ${LANGUAGE_GUIDANCE[code].label}: ${LANGUAGE_GUIDANCE[code].rule}`)
  .join('\n');

function localizedSchemeName(s: Scheme, language: SupportedLanguage): string {
  if (language === 'hi') return s.nameHi || s.name;
  if (language === 'te') return s.nameTe || s.name;
  return s.name;
}

function localizedServiceName(s: PublicService, language: SupportedLanguage): string {
  if (language === 'hi') return s.nameHi || s.name;
  if (language === 'te') return s.nameTe || s.name;
  return s.name;
}

function localizedSchemeSummary(s: Scheme, language: SupportedLanguage): string {
  if (language === 'hi') return s.summaryHi || s.summary;
  if (language === 'te') return s.summaryTe || s.summary;
  return s.summary;
}

const FALLBACK_CONTEXT: SahayakContext = {
  schemes: DEMO_SCHEMES,
  services: DEMO_SERVICES,
  offices: [],
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function findSchemes(query: string, schemes: Scheme[]): Scheme[] {
  const q = normalize(query);
  const terms = q.split(' ').filter((t) => t.length > 2);
  return schemes
    .map((s) => {
      const haystack = normalize(
        [s.name, s.department, s.category, s.summary, s.intendedBeneficiaries, s.benefits].join(' ')
      );
      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += 1;
      }
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.s);
}

function findServices(query: string, services: PublicService[]): PublicService[] {
  const q = normalize(query);
  const terms = q.split(' ').filter((t) => t.length > 2);
  return services
    .map((s) => {
      const haystack = normalize(
        [s.name, s.department, s.category, s.description, s.targetAudience].join(' ')
      );
      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += 1;
      }
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.s);
}

const UI_TEXT: Record<
  SupportedLanguage,
  {
    greeting: string;
    eligibilityHeading: (name: string) => string;
    documents: string;
    useAssessment: string;
    servicesHeading: string;
    schemesHeading: string;
    verifyNote: string;
    officeHeading: string;
    noOffices: string;
    docAnswer: string;
    fallback: string;
    // Database-grounded answers (used when Gemini is unavailable)
    dbAnswerHeading: (count: number) => string;
    noSchemeMatch: string;
    eligibilityLabel: string;
    benefitsLabel: string;
    documentsLabel: string;
    incomeLabel: string;
    statusLabel: string;
    applyLabel: string;
    verifiedLabel: string;
    dbVerifyNote: string;
    windowStatus: (status: string) => string;
  }
> = {
  en: {
    greeting:
      'Namaste! I am the SCHEMATRIX assistant (built-in verified dataset). I can help you with:\n\n' +
      '• Government welfare schemes (e.g. PM-KISAN, Ayushman Bharat, PMAY-G, MGNREGA)\n' +
      '• Eligibility questions for a scheme\n' +
      '• Public services such as income, caste, or land certificates\n' +
      '• Finding your nearest government office\n\n' +
      'Try asking: "Am I eligible for PM-KISAN?" or "How do I get an income certificate?"',
    eligibilityHeading: (name) => `For "${name}", the main eligibility conditions are:`,
    documents: 'Required documents:',
    useAssessment:
      'To confirm your exact eligibility, use the Eligibility Assessment section and answer a few simple questions.',
    servicesHeading: 'Here are relevant public services:',
    schemesHeading: 'Here are relevant government schemes:',
    verifyNote: 'Note: Always verify current rules on the official portal before applying.',
    dbAnswerHeading: (count) =>
      `Database-based answer (not live AI). ${count} verified scheme record(s) matched your question:`,
    noSchemeMatch:
      'No matching scheme record was found in the SCHEMATRIX database for this question. ' +
      'Try naming a scheme, a state, or an education level, or open the Scheme Directory to browse all verified records.',
    eligibilityLabel: 'Eligibility',
    benefitsLabel: 'Benefits',
    documentsLabel: 'Documents',
    incomeLabel: 'Income limit',
    statusLabel: 'Application status',
    applyLabel: 'Apply',
    verifiedLabel: 'Last verified',
    dbVerifyNote:
      'This answer comes from the SCHEMATRIX database, not from live AI. Always confirm the current rules and dates on the official government portal before applying.',
    windowStatus: (status) =>
      ({
        open: 'Open',
        closed: 'Closed',
        upcoming: 'Upcoming',
        unconfirmed: 'Not confirmed on the official page — check the portal',
      })[status] ?? 'Not confirmed on the official page — check the portal',
    officeHeading:
      'You can find government offices using the "Nearby Offices" section, which supports filters by state, district, mandal, and village, plus distance from your location.',
    noOffices:
      'No verified office records are currently published in the directory, so I cannot list specific offices yet.',
    docAnswer:
      'You can store important documents (Aadhaar, ration card, income certificate, land records, etc.) in the Document Vault section. ' +
      'Common documents required across schemes include: Aadhaar Card, Ration Card, Bank Passbook, Income Certificate, and Land Records.',
    fallback:
      'I am the built-in dataset assistant, so I can only answer from the verified dataset bundled with the app. ' +
      'Try asking about a specific scheme (e.g. "PM-KISAN", "Ayushman Bharat", "PMAY-G", "MGNREGA"), ' +
      'a public service (e.g. "income certificate", "caste certificate", "land records"), or "offices near me".\n\n' +
      'For a live AI answer, configure the GEMINI_API_KEY environment variable.',
  },
  hi: {
    greeting:
      'नमस्ते! मैं स्कीमैट्रिक्स सहायक हूँ (अंतर्निहित सत्यापित डेटासेट)। मैं इनमें मदद कर सकता हूँ:\n\n' +
      '• सरकारी कल्याण योजनाएँ (जैसे PM-KISAN, आयुष्मान भारत, PMAY-G, MGNREGA)\n' +
      '• किसी योजना की पात्रता के प्रश्न\n' +
      '• आय, जाति या भूमि प्रमाणपत्र जैसी सार्वजनिक सेवाएँ\n' +
      '• अपने नज़दीकी सरकारी कार्यालय का पता लगाना\n\n' +
      'पूछकर देखें: "क्या मैं PM-KISAN के लिए पात्र हूँ?" या "मैं आय प्रमाणपत्र कैसे पाऊँ?"',
    eligibilityHeading: (name) => `"${name}" के लिए मुख्य पात्रता शर्तें ये हैं:`,
    documents: 'आवश्यक दस्तावेज़:',
    useAssessment:
      'अपनी सटीक पात्रता जानने के लिए पात्रता मूल्यांकन अनुभाग में कुछ सरल प्रश्नों के उत्तर दें।',
    servicesHeading: 'यहाँ संबंधित सार्वजनिक सेवाएँ हैं:',
    schemesHeading: 'यहाँ संबंधित सरकारी योजनाएँ हैं:',
    verifyNote: 'नोट: आवेदन करने से पहले आधिकारिक पोर्टल पर नियमों की पुष्टि अवश्य करें।',
    dbAnswerHeading: (count) =>
      `डेटाबेस-आधारित उत्तर (लाइव एआई नहीं)। आपके प्रश्न से ${count} सत्यापित योजना रिकॉर्ड मेल खाते हैं:`,
    noSchemeMatch:
      'इस प्रश्न के लिए SCHEMATRIX डेटाबेस में कोई मेल खाता योजना रिकॉर्ड नहीं मिला। ' +
      'किसी योजना का नाम, राज्य या शिक्षा स्तर बताकर पूछें, या सभी सत्यापित रिकॉर्ड देखने के लिए योजना निर्देशिका खोलें।',
    eligibilityLabel: 'पात्रता',
    benefitsLabel: 'लाभ',
    documentsLabel: 'दस्तावेज़',
    incomeLabel: 'आय सीमा',
    statusLabel: 'आवेदन स्थिति',
    applyLabel: 'आवेदन करें',
    verifiedLabel: 'अंतिम सत्यापन',
    dbVerifyNote:
      'यह उत्तर SCHEMATRIX डेटाबेस से है, लाइव एआई से नहीं। आवेदन करने से पहले आधिकारिक सरकारी पोर्टल पर वर्तमान नियम और तिथियाँ अवश्य जाँचें।',
    windowStatus: (status) =>
      ({
        open: 'खुली है',
        closed: 'बंद है',
        upcoming: 'आगे आएगी',
        unconfirmed: 'आधिकारिक पृष्ठ पर पुष्टि नहीं — पोर्टल देखें',
      })[status] ?? 'आधिकारिक पृष्ठ पर पुष्टि नहीं — पोर्टल देखें',
    officeHeading:
      '"आसपास के कार्यालय" अनुभाग से राज्य, ज़िला, मंडल और गाँव के अनुसार तथा अपनी लोकेशन से दूरी के अनुसार सरकारी कार्यालय खोज सकते हैं।',
    noOffices:
      'वर्तमान में निर्देशिका में कोई सत्यापित कार्यालय रिकॉर्ड प्रकाशित नहीं है, इसलिए मैं अभी विशेष कार्यालय नहीं बता सकता।',
    docAnswer:
      'आप आधार, राशन कार्ड, आय प्रमाणपत्र, भूमि रिकॉर्ड आदि महत्वपूर्ण दस्तावेज़ दस्तावेज़ तिजोरी अनुभाग में रख सकते हैं। ' +
      'सामान्यतः आवश्यक दस्तावेज़: आधार कार्ड, राशन कार्ड, बैंक पासबुक, आय प्रमाणपत्र और भूमि रिकॉर्ड।',
    fallback:
      'मैं अंतर्निहित डेटासेट सहायक हूँ, इसलिए केवल ऐप में दिए गए सत्यापित डेटासेट से ही उत्तर दे सकता हूँ। ' +
      'किसी विशेष योजना (जैसे PM-KISAN, आयुष्मान भारत), सार्वजनिक सेवा (जैसे आय प्रमाणपत्र) या "मेरे पास के कार्यालय" के बारे में पूछें।\n\n' +
      'लाइव एआई उत्तर के लिए GEMINI_API_KEY वातावरण चर सेट करें।',
  },
  te: {
    greeting:
      'నమస్కారం! నేను స్కీమ్యాట్రిక్స్ సహాయక్‌ను (అంతర్నిర్మిత ధృవీకరించిన డేటాసెట్). నేను వీటిలో సహాయం చేయగలను:\n\n' +
      '• ప్రభుత్వ సంక్షేమ పథకాలు (ఉదా. PM-KISAN, ఆయుష్మాన్ భారత్, PMAY-G, MGNREGA)\n' +
      '• పథకానికి అర్హత సంబంధిత ప్రశ్నలు\n' +
      '• ఆదాయం, జాతి లేదా భూమి ధృవీకరణ పత్రాల వంటి ప్రజా సేవలు\n' +
      '• మీ సమీపంలోని ప్రభుత్వ కార్యాలయాన్ని కనుగొనడం\n\n' +
      'అడగండి: "నేను PM-KISANకి అర్హుడినా?" లేదా "ఆదాయ ధృవీకరణ పత్రం ఎలా పొందాలి?"',
    eligibilityHeading: (name) => `"${name}" కోసం ప్రధాన అర్హత నిబంధనలు ఇవి:`,
    documents: 'అవసరమైన పత్రాలు:',
    useAssessment:
      'మీ ఖచ్చితమైన అర్హత తెలుసుకోవడానికి అర్హత మూల్యాంకన విభాగంలో కొన్ని సులభ ప్రశ్నలకు సమాధానం ఇవ్వండి.',
    servicesHeading: 'ఇక్కడ సంబంధిత ప్రజా సేవలు ఉన్నాయి:',
    schemesHeading: 'ఇక్కడ సంబంధిత ప్రభుత్వ పథకాలు ఉన్నాయి:',
    verifyNote:
      'గమనిక: దరఖాస్తు చేసే ముందు అధికారిక పోర్టల్‌లో ప్రస్తుత నియమాలను తనిఖీ చేయండి.',
    dbAnswerHeading: (count) =>
      `డేటాబేస్ ఆధారిత సమాధానం (లైవ్ AI కాదు). మీ ప్రశ్నకు ${count} ధృవీకరించిన పథక రికార్డులు సరిపోలాయి:`,
    noSchemeMatch:
      'ఈ ప్రశ్నకు SCHEMATRIX డేటాబేస్‌లో సరిపోయే పథక రికార్డు ఏదీ కనుగొనబడలేదు. ' +
      'పథక పేరు, రాష్ట్రం లేదా విద్యా స్థాయిని పేర్కొని అడగండి, లేదా అన్ని ధృవీకరించిన రికార్డుల కోసం పథక డైరెక్టరీ తెరవండి.',
    eligibilityLabel: 'అర్హత',
    benefitsLabel: 'ప్రయోజనాలు',
    documentsLabel: 'పత్రాలు',
    incomeLabel: 'ఆదాయ పరిమితి',
    statusLabel: 'దరఖాస్తు స్థితి',
    applyLabel: 'దరఖాస్తు చేయండి',
    verifiedLabel: 'చివరి ధృవీకరణ',
    dbVerifyNote:
      'ఈ సమాధానం SCHEMATRIX డేటాబేస్ నుండి వచ్చింది, లైవ్ AI నుండి కాదు. దరఖాస్తు చేసే ముందు అధికారిక ప్రభుత్వ పోర్టల్‌లో ప్రస్తుత నియమాలు మరియు తేదీలను తప్పక తనిఖీ చేయండి.',
    windowStatus: (status) =>
      ({
        open: 'తెరిచి ఉంది',
        closed: 'మూసివేయబడింది',
        upcoming: 'రాబోతోంది',
        unconfirmed: 'అధికారిక పేజీలో నిర్ధారించబడలేదు — పోర్టల్ చూడండి',
      })[status] ?? 'అధికారిక పేజీలో నిర్ధారించబడలేదు — పోర్టల్ చూడండి',
    officeHeading:
      '"సమీప కార్యాలయాలు" విభాగం ద్వారా రాష్ట్రం, జిల్లా, మండలం, గ్రామం ప్రకారం మరియు మీ ప్రదేశం నుండి దూరం ప్రకారం ప్రభుత్వ కార్యాలయాలను కనుగొనవచ్చు.',
    noOffices:
      'ప్రస్తుతం డైరెక్టరీలో ధృవీకరించిన కార్యాలయ రికార్డులు ఏవీ ప్రచురించబడలేదు, కాబట్టి ఇప్పుడు నిర్దిష్ట కార్యాలయాలను చెప్పలేను.',
    docAnswer:
      'ఆధార్, రేషన్ కార్డు, ఆదాయ ధృవీకరణ పత్రం, భూమి రికార్డులు మొదలైన ముఖ్య పత్రాలను డాక్యుమెంట్ వాల్ట్ విభాగంలో నిల్వ చేసుకోవచ్చు. ' +
      'సాధారణంగా అవసరమైన పత్రాలు: ఆధార్ కార్డు, రేషన్ కార్డు, బ్యాంకు పాస్‌బుక్, ఆదాయ ధృవీకరణ పత్రం, భూమి రికార్డులు.',
    fallback:
      'నేను అంతర్నిర్మిత డేటాసెట్ సహాయక్‌ను, కాబట్టి యాప్‌లో ఉన్న ధృవీకరించిన డేటాసెట్‌ నుండే సమాధానం ఇవ్వగలను. ' +
      'నిర్దిష్ట పథకం (ఉదా. PM-KISAN), ప్రజా సేవ (ఉదా. ఆదాయ ధృవీకరణ పత్రం) లేదా "నా సమీపంలో కార్యాలయాలు" గురించి అడగండి.\n\n' +
      'లైవ్ ఏఐ సమాధానం కోసం GEMINI_API_KEY వాతావరణ చరరాశిని సెట్ చేయండి.',
  },
};

function formatSchemes(schemes: Scheme[], language: SupportedLanguage): string {
  if (schemes.length === 0) return '';
  return schemes
    .map((s, i) => {
      const native = localizedSchemeName(s, language);
      const name = native !== s.name ? `${native} (${s.name})` : s.name;
      return `${i + 1}. ${name} (${s.department})\n   ${localizedSchemeSummary(s, language)}\n   ${s.officialUrl}` +
        (s.contactHelpline ? `\n   ${s.contactHelpline}` : '');
    })
    .join('\n\n');
}

function formatServices(services: PublicService[], language: SupportedLanguage): string {
  if (services.length === 0) return '';
  return services
    .map((s, i) => {
      const native = localizedServiceName(s, language);
      const name = native !== s.name ? `${native} (${s.name})` : s.name;
      return `${i + 1}. ${name} (${s.department})\n   ${s.description}\n   ${s.officialUrl}`;
    })
    .join('\n\n');
}

/**
 * Deterministic offline assistant. Produces useful, source-grounded answers from
 * the local seed dataset without any network calls, in the language the question
 * was written in. Never presents itself as a live AI response.
 */
export function demoSahayakAnswer(
  query: string,
  context: SahayakContext = FALLBACK_CONTEXT,
  language: SupportedLanguage = 'en'
): SahayakReply {
  const ui = UI_TEXT[language] || UI_TEXT.en;
  const q = normalize(query);
  const sources: SahayakSource[] = [];
  const parts: string[] = [];

  const greeting =
    /^(hi|hello|hey|namaste|namaskar|help|start|what can you do|नमस्ते|నమస్కారం)/.test(q) ||
    q.length < 4;

  if (greeting) {
    return { mode: 'demo', text: ui.greeting, sources: [] };
  }

  // Eligibility-style questions
  if (/(eligib|qualif|am i|can i get|do i qualify|पात्र|అర్హ)/.test(q)) {
    const matches = findSchemes(query, context.schemes);
    if (matches.length > 0) {
      const primary = matches[0];
      const primaryName =
        localizedSchemeName(primary, language) !== primary.name
          ? `${localizedSchemeName(primary, language)} (${primary.name})`
          : primary.name;
      parts.push(ui.eligibilityHeading(primaryName));
      parts.push(primary.eligibilityCriteria.map((c) => `• ${c}`).join('\n'));
      parts.push(`${ui.documents} ${primary.requiredDocuments.join(', ')}.`);
      parts.push(ui.useAssessment);
      for (const m of matches) {
        sources.push({ label: `${m.name} — ${m.officialUrl}`, url: m.officialUrl });
      }
      return { mode: 'demo', text: parts.join('\n\n'), sources };
    }
  }

  // Scheme search
  const schemeMatches = findSchemes(query, context.schemes);
  if (schemeMatches.length > 0) {
    parts.push(ui.schemesHeading);
    parts.push(formatSchemes(schemeMatches, language));
    parts.push(ui.verifyNote);
    for (const m of schemeMatches) {
      sources.push({ label: `${m.name} — ${m.officialUrl}`, url: m.officialUrl });
    }
    return { mode: 'demo', text: parts.join('\n\n'), sources };
  }

  // Service-intent questions (e.g. "how do I get an income certificate")
  const serviceIntent = /(certificate|how do i get|how to get|apply for|apply to|service|passport|ration card|land record|pahani|1-b|1b|ధృవీకరణ|ప్రమాణ|प्रमाणपत्र)/.test(
    q
  );
  if (serviceIntent) {
    const serviceMatches = findServices(query, context.services);
    if (serviceMatches.length > 0) {
      parts.push(ui.servicesHeading);
      parts.push(formatServices(serviceMatches, language));
      for (const m of serviceMatches) {
        sources.push({ label: `${m.name} — ${m.officialUrl}`, url: m.officialUrl });
      }
      return { mode: 'demo', text: parts.join('\n\n'), sources };
    }
  }

  // Service search
  const serviceMatches = findServices(query, context.services);
  if (serviceMatches.length > 0) {
    parts.push(ui.servicesHeading);
    parts.push(formatServices(serviceMatches, language));
    for (const m of serviceMatches) {
      sources.push({ label: `${m.name} — ${m.officialUrl}`, url: m.officialUrl });
    }
    return { mode: 'demo', text: parts.join('\n\n'), sources };
  }

  // Office / location
  if (/(office|near|location|address|which place|where|కార్యాలయ|दफ़्तर)/.test(q)) {
    parts.push(
      'You can find government offices using the "Nearby Offices" section, which supports filters by state, district, mandal, and village, plus distance from your location.'
    );
    const known = context.offices.slice(0, 3);
    if (known.length > 0) {
      parts.push('Some offices in the verified directory:');
      parts.push(
        known
          .map((o) => `• ${o.name} — ${o.address}, ${o.district}, ${o.state} (${o.phone})`)
          .join('\n')
      );
    } else {
      parts.push(
        'No verified office records are currently published in the directory, so I cannot list specific offices yet.'
      );
    }
    return { mode: 'demo', text: parts.join('\n\n'), sources };
  }


  // Documents / vault
  if (/(document|vault|upload|aadhaar|ration|certificate|kagaz|कागज़|दस्तावेज़|పత్రాలు|కాగితం)/.test(q)) {
    return { mode: 'demo', text: ui.docAnswer, sources: [] };
  }

  // Fallback
  return { mode: 'demo', text: ui.fallback, sources: [] };
}
/**
 * Build the system prompt grounding Gemini in SCHEMATRIX's verified dataset.
 * `language` selects the reply language ('auto' mirrors the question's script).
 * The prompt forbids inventing schemes/rules/links and requires separating
 * verified data from general guidance.
 */
export function buildSahayakSystemPrompt(
  context: SahayakContext,
  language: SahayakReplyMode = 'auto'
): string {
  const target: SupportedLanguage = language === 'auto' ? 'en' : language;
  const guidance = LANGUAGE_GUIDANCE[target];
  const auto = language === 'auto';

  // Dataset lines carry the English (official) name plus a native-language form
  // when one exists, so Gemini can render either language without inventing.
  const schemeLines = context.schemes
    .map((s) => {
      const names = (['hi', 'te'] as SupportedLanguage[])
        .map((code) => {
          const native = localizedSchemeName(s, code);
          return native !== s.name ? `${LANGUAGE_GUIDANCE[code].label}: ${native}` : '';
        })
        .filter(Boolean)
        .join(' | ');
      return (
        `- ${s.name} (${s.department})` +
        (names ? ` [${names}]` : '') +
        `: ${s.summary} | Eligibility: ${s.eligibilityCriteria.join('; ')}` +
        ` | Docs: ${s.requiredDocuments.join(', ')} | Portal: ${s.officialUrl}`
      );
    })
    .join('\n');

  const serviceLines = context.services
    .map((s) => {
      const names = (['hi', 'te'] as SupportedLanguage[])
        .map((code) => {
          const native = localizedServiceName(s, code);
          return native !== s.name ? `${LANGUAGE_GUIDANCE[code].label}: ${native}` : '';
        })
        .filter(Boolean)
        .join(' | ');
      return (
        `- ${s.name} (${s.department})` +
        (names ? ` [${names}]` : '') +
        `: ${s.description} | Portal: ${s.officialUrl}`
      );
    })
    .join('\n');

  const languageRule = auto
    ? 'LANGUAGE: First determine which language the citizen wrote in. ' +
      'Telugu script characters mean the question is Telugu. Devanagari script characters mean the question is Hindi. ' +
      'Otherwise the question is English. Then write your ENTIRE reply in that SAME language, in that language\'s own native script. ' +
      'Never reply in a different language than the citizen used. ' +
      'An English question MUST be answered in English; a Hindi question in Hindi; a Telugu question in Telugu. ' +
      'A reply that is English prose merely labelled as Hindi or Telugu is WRONG — the words themselves must be in that language.\n\n' +
      'Write every reply in the citizen\'s language, using these rules:\n' +
      ALL_LANGUAGE_RULES
    : `- ${guidance.rule}`;

  return (
    'You are AI Sahayak, a helpful multilingual assistant for the SCHEMATRIX Indian government welfare platform. ' +
    'Answer citizens about government schemes, eligibility, required documents, application procedures, ' +
    'rural services and government assistance.\n\n' +
    'STRICT RULES:\n' +
    '- Only state scheme names, eligibility rules, benefits, document lists, links or procedures that appear in the VERIFIED dataset below. ' +
    'Never invent or guess them.\n' +
    '- Keep official scheme and department names exactly as given in the dataset. ' +
    'If you give a translated form of an official name, put the official English name in brackets after it, ' +
    'for example a Telugu form followed by (PM-KISAN). Never rename, renumber or alter an official scheme name.\n' +
    '- Clearly separate "VERIFIED (from SCHEMATRIX data)" facts from "GENERAL GUIDANCE". ' +
    'If something is not in the verified dataset, say you are not certain and advise checking the official government portal.\n' +
    '- Never claim an application was submitted, received, or approved. SCHEMATRIX does not file applications.\n' +
    '- Be concise and cite the official portal URL when relevant.\n' +
    '- Use short sentences and simple, everyday vocabulary suitable for a rural citizen. ' +
    'Explain any unavoidable technical term in plain words.\n' +
    '- Never answer with a placeholder, a translation note, or a statement that you cannot reply in the user\'s language.\n' +
    `- ${languageRule}\n\n` +
    'VERIFIED SCHEMES:\n' +
    schemeLines +
    '\n\nVERIFIED SERVICES:\n' +
    serviceLines
  );
}

// ==============================================================================
// Database-grounded retrieval (Part 7)
//
// AI Sahayak must consult the MongoDB scheme database BEFORE it answers. These
// helpers pick the records most likely to be relevant, so the model (or the
// deterministic fallback) is grounding on real stored records rather than
// generic knowledge.
// ==============================================================================

/** How many database records are handed to the model as grounding. */
const GROUNDING_LIMIT = Number(process.env.SAHAYAK_GROUNDING_LIMIT || 8);

/**
 * Rank the database records most relevant to a citizen's question. Uses the
 * same scoring as the public directory so Sahayak and the finder agree.
 */
export function rankSchemesForQuery(
  schemes: SchemeWithDiscovery[],
  query: string,
  limit = GROUNDING_LIMIT
): SchemeWithDiscovery[] {
  if (!query.trim()) return schemes.slice(0, limit);

  return schemes
    .map((scheme) => ({ scheme, score: scoreTextMatch(scheme, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.scheme.name.localeCompare(b.scheme.name))
    .slice(0, limit)
    .map((entry) => entry.scheme);
}

/**
 * Build the grounding block sent to Gemini. Only records actually retrieved
 * from the database are included, each with its source URL and verification
 * date, so the model can cite them and cannot present unsourced facts.
 */
export function buildGroundingBlock(schemes: SchemeWithDiscovery[]): string {
  if (schemes.length === 0) return 'No matching records were found in the SCHEMATRIX database.';

  const lines = schemes.map((s) => {
    const parts = [
      `- ${s.name} [id: ${s.id}]`,
      `  Department: ${s.department}`,
      `  Category: ${s.category}`,
      `  Education level: ${s.educationLevel ?? 'Not specified in official source'}`,
      `  Summary: ${s.summary}`,
      `  Eligibility: ${s.eligibilityCriteria.join('; ')}`,
      `  Benefits: ${s.benefits}`,
      `  Documents: ${s.requiredDocuments.join(', ')}`,
      `  Income limit: ${s.incomeLimitAnnual === null || s.incomeLimitAnnual === undefined ? 'Not specified in official source' : formatIncomeLimit(s.incomeLimitAnnual)}`,
      `  Application window: ${s.applicationStatus ?? 'unconfirmed'}${s.applicationEndDate ? ` (closes ${s.applicationEndDate})` : ''}`,
      `  Academic year: ${s.academicYear ?? 'Not specified in official source'}`,
      `  Apply: ${s.applyUrl ?? s.officialUrl}`,
      `  Source: ${s.officialSourceUrl ?? s.officialUrl}`,
      `  Last verified: ${s.lastVerifiedAt ?? 'Not specified in official source'}`,
    ];
    return parts.join('\n');
  });

  return lines.join('\n\n');
}

/**
 * Deterministic answer built purely from retrieved database records.
 *
 * Used whenever Gemini is unavailable, so a citizen still receives the real
 * matching schemes, their eligibility, official links and verification dates.
 * The reply is always labelled as database-based, never as a live AI answer.
 */
export function databaseAnswer(
  query: string,
  retrieved: SchemeWithDiscovery[],
  language: SupportedLanguage = 'en'
): SahayakReply {
  const ui = UI_TEXT[language] || UI_TEXT.en;
  const sources: SahayakSource[] = [];
  const parts: string[] = [];

  if (retrieved.length === 0) {
    return {
      mode: 'demo',
      text: ui.noSchemeMatch,
      sources: [],
    };
  }

  parts.push(ui.dbAnswerHeading(retrieved.length));

  const lines = retrieved.map((s) => {
    const name =
      localizedSchemeName(s, language) !== s.name
        ? `${localizedSchemeName(s, language)} (${s.name})`
        : s.name;
    const status = s.applicationStatus ?? 'unconfirmed';
    const statusLabel = ui.windowStatus(status);
    const income =
      s.incomeLimitAnnual === null || s.incomeLimitAnnual === undefined
        ? null
        : formatIncomeLimit(s.incomeLimitAnnual);

    const detail = [
      `• ${name}`,
      `  ${s.summary}`,
      `  ${ui.eligibilityLabel}: ${s.eligibilityCriteria.join('; ')}`,
      `  ${ui.benefitsLabel}: ${s.benefits}`,
      `  ${ui.documentsLabel}: ${s.requiredDocuments.join(', ')}`,
      income ? `  ${ui.incomeLabel}: ${income}` : null,
      `  ${ui.statusLabel}: ${statusLabel}`,
      `  ${ui.applyLabel}: ${s.applyUrl ?? s.officialUrl}`,
      `  ${ui.verifiedLabel}: ${s.lastVerifiedAt ?? 'Not specified in official source'}`,
    ]
      .filter(Boolean)
      .join('\n');

    sources.push({
      label: `${s.name} — ${s.officialSourceUrl ?? s.officialUrl}`,
      url: s.officialSourceUrl ?? s.officialUrl,
    });

    return detail;
  });

  parts.push(lines.join('\n\n'));
  parts.push(ui.dbVerifyNote);

  return { mode: 'demo', text: parts.join('\n\n'), sources };
}

