// ==============================================================================
// SCHEMATRIX - Deterministic Eligibility Assessment Engine
// 100% Rule-based, source-grounded, zero-hallucination entitlement evaluation
// ==============================================================================

export type AssessmentResult = 'appears_eligible' | 'criteria_not_met' | 'insufficient_information';

export interface CitizenAnswers {
  // Step 1: Demographics & Location
  age?: number;
  gender?: 'female' | 'male' | 'other';
  state?: string;
  district?: string;
  areaType?: 'rural' | 'urban';

  // Step 2: Occupation & Landholding
  occupation?: 'farmer' | 'laborer' | 'artisan' | 'self_employed' | 'salaried' | 'unemployed' | 'senior';
  isFarmer?: boolean;
  ownsCultivableLand?: boolean;
  landHoldingAcres?: number;
  isInstitutionalLandholder?: boolean;
  annualFamilyIncome?: number;

  // Step 3: Housing & Household Amenities
  ownsPuccaHouse?: boolean;
  livesInKutchaHouse?: boolean;
  hasLpgConnectionInHousehold?: boolean;
  rationCardCategory?: 'antyodaya_aay' | 'bpl_priority' | 'apl' | 'none';
  isSeniorCitizen70PlusInFamily?: boolean;
  isCoveredByGovtEmployeeHealthInsurance?: boolean; // ESIC / CGHS

  // Step 4: Exclusions & DBT Verification
  isGovtEmployeeOrPensionerInFamily?: boolean;
  paysIncomeTax?: boolean;
  ownsMotorizedFourWheelerOrTractor?: boolean;
  hasAadhaarLinkedBankDbt?: boolean;
  willingForUnskilledManualWork?: boolean;
}

export interface SchemeEvaluation {
  schemeId: string;
  schemeName: string;
  schemeNameHi?: string;
  schemeNameTe?: string;
  category: string;
  result: AssessmentResult;
  criteriaSatisfied: string[];
  criteriaNotSatisfied: string[];
  missingInformation: string[];
  explanation: string;
  requiredDocuments: string[];
  officialUrl: string;
  rulesVersion: string;
  lastReviewedAt: string;
}

// ==============================================================================
// 1. SCHEME SPECIFIC RULE EVALUATORS
// ==============================================================================

/**
 * 1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)
 * ₹6,000/yr direct income support
 */
export function evaluatePmKisan(answers: CitizenAnswers): SchemeEvaluation {
  const satisfied: string[] = [];
  const notSatisfied: string[] = [];
  const missing: string[] = [];

  // Exclusions (Strict Legal Disqualifiers)
  if (answers.paysIncomeTax === true) {
    notSatisfied.push('Individuals who paid income tax in the previous assessment year are legally excluded.');
  } else if (answers.paysIncomeTax === false) {
    satisfied.push('Non-taxpayer status confirmed.');
  } else {
    missing.push('Income tax payment status in the last assessment year.');
  }

  if (answers.isGovtEmployeeOrPensionerInFamily === true) {
    notSatisfied.push('Serving/retired government officials (Group A, B, C) or monthly pensioners ≥ ₹10,000 are excluded.');
  } else if (answers.isGovtEmployeeOrPensionerInFamily === false) {
    satisfied.push('No government employment or excluded pension in family.');
  } else {
    missing.push('Government employment / pension status verification.');
  }

  if (answers.isInstitutionalLandholder === true) {
    notSatisfied.push('Institutional landholders, trusts, and companies are excluded.');
  } else if (answers.isInstitutionalLandholder === false) {
    satisfied.push('Individual farmer family ownership confirmed.');
  }

  // Core Entitlement: Cultivable Landholding
  if (answers.ownsCultivableLand === true || answers.isFarmer === true) {
    satisfied.push('Possesses cultivable agricultural land in applicant or family name with state revenue records.');
  } else if (answers.ownsCultivableLand === false) {
    notSatisfied.push('Must possess cultivable landholding in revenue land records.');
  } else {
    missing.push('Landownership and cultivable landholding verification.');
  }

  // Banking: DBT
  if (answers.hasAadhaarLinkedBankDbt === true) {
    satisfied.push('Aadhaar-seeded bank account active for Direct Benefit Transfer (DBT).');
  } else if (answers.hasAadhaarLinkedBankDbt === false) {
    missing.push('Bank account must be seeded with Aadhaar and DBT-enabled.');
  } else {
    missing.push('Aadhaar-seeded bank account status.');
  }

  let result: AssessmentResult = 'appears_eligible';
  let explanation = '';

  if (notSatisfied.length > 0) {
    result = 'criteria_not_met';
    explanation = `Criteria not met: ${notSatisfied[0]}`;
  } else if (missing.length > 0) {
    result = 'insufficient_information';
    explanation = `More information needed: ${missing.slice(0, 2).join(' ')}`;
  } else {
    explanation = 'Citizen appears eligible for PM-KISAN ₹6,000 annual direct income support transferred in 3 equal installments of ₹2,000 via DBT.';
  }

  return {
    schemeId: 'pm-kisan',
    schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    schemeNameHi: 'प्रधानमंत्री किसान सम्मान निधि',
    schemeNameTe: 'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి',
    category: 'Agriculture',
    result,
    criteriaSatisfied: satisfied,
    criteriaNotSatisfied: notSatisfied,
    missingInformation: missing,
    explanation,
    requiredDocuments: [
      'Aadhaar Card of landholder',
      'Updated Land Records (Patta / RoR / Pahani / 1-B)',
      'Active Bank Passbook (DBT seeded)',
      'Aadhaar-linked Mobile Number',
    ],
    officialUrl: 'https://pmkisan.gov.in',
    rulesVersion: '2024.1',
    lastReviewedAt: '2026-10-15',
  };
}

/**
 * 2. Ayushman Bharat PM-JAY
 * ₹5 Lakh cashless health cover + Ayushman Vaya Vandana (70+)
 */
export function evaluateAyushmanBharat(answers: CitizenAnswers): SchemeEvaluation {
  const satisfied: string[] = [];
  const notSatisfied: string[] = [];
  const missing: string[] = [];

  // Strict Exclusion: Already covered by CGHS / ESIC
  if (answers.isCoveredByGovtEmployeeHealthInsurance === true) {
    notSatisfied.push('Households already covered under institutional government employee health insurance (CGHS/ESIC) are excluded.');
  } else if (answers.isCoveredByGovtEmployeeHealthInsurance === false) {
    satisfied.push('Not enrolled in excluded government employee health schemes.');
  } else {
    missing.push('Existing government employee healthcare coverage status.');
  }

  // Qualifying Criteria (Any of the following qualifies):
  const isSenior70 = answers.isSeniorCitizen70PlusInFamily === true || (answers.age !== undefined && answers.age >= 70);
  const hasRationCard = answers.rationCardCategory === 'bpl_priority' || answers.rationCardCategory === 'antyodaya_aay';
  const isDeprivedIncome = answers.annualFamilyIncome !== undefined && answers.annualFamilyIncome <= 250000;

  if (isSenior70) {
    satisfied.push('Senior citizen aged 70+ qualifies under newly expanded Ayushman Vaya Vandana scheme regardless of income.');
  }

  if (hasRationCard) {
    satisfied.push('Household holds verified BPL / Antyodaya / Priority NFSA ration card.');
  }

  if (isDeprivedIncome && answers.areaType === 'rural') {
    satisfied.push('Rural household income within SECC economic deprivation threshold.');
  }

  if (!isSenior70 && !hasRationCard && !isDeprivedIncome) {
    if (answers.rationCardCategory === undefined && answers.annualFamilyIncome === undefined) {
      missing.push('Ration card type or family annual income details.');
    } else {
      notSatisfied.push('Applicant family does not meet SECC rural deprivation, NFSA ration card, or 70+ senior citizen inclusion criteria.');
    }
  }

  let result: AssessmentResult = 'appears_eligible';
  let explanation = '';

  if (notSatisfied.length > 0) {
    result = 'criteria_not_met';
    explanation = notSatisfied[0];
  } else if (missing.length > 0) {
    result = 'insufficient_information';
    explanation = `Additional data required: ${missing.join(', ')}`;
  } else {
    explanation = 'Citizen appears eligible for ₹5,00,000 annual cashless hospitalisation cover across 28,000+ public and empanelled private hospitals.';
  }

  return {
    schemeId: 'ayushman-bharat',
    schemeName: 'Ayushman Bharat PM-JAY (Jan Arogya Yojana)',
    schemeNameHi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
    schemeNameTe: 'ఆయుష్మాన్ భారత్ - ప్రధాన మంత్రి జన్ ఆరోగ్య యోజన',
    category: 'Health',
    result,
    criteriaSatisfied: satisfied,
    criteriaNotSatisfied: notSatisfied,
    missingInformation: missing,
    explanation,
    requiredDocuments: [
      'Aadhaar Card of all family members',
      'Ration Card / PMJAY Family Letter',
      'Active Mobile Number for OTP authentication',
    ],
    officialUrl: 'https://pmjay.gov.in',
    rulesVersion: '2024.1',
    lastReviewedAt: '2026-10-15',
  };
}

/**
 * 3. Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)
 * ₹1.20L – ₹1.30L pucca housing subsidy
 */
export function evaluatePmayG(answers: CitizenAnswers): SchemeEvaluation {
  const satisfied: string[] = [];
  const notSatisfied: string[] = [];
  const missing: string[] = [];

  // Rural location requirement
  if (answers.areaType === 'rural') {
    satisfied.push('Resides in rural area under Gram Panchayat jurisdiction.');
  } else if (answers.areaType === 'urban') {
    notSatisfied.push('PMAY-G is exclusively for rural citizens (urban citizens may apply for PMAY-Urban).');
  } else {
    missing.push('Rural or urban residential location.');
  }

  // Housing condition requirement
  if (answers.ownsPuccaHouse === true) {
    notSatisfied.push('Households owning a pucca (concrete/brick) house anywhere in India are strictly excluded.');
  } else if (answers.ownsPuccaHouse === false) {
    satisfied.push('Does not own any pucca house.');
  } else {
    missing.push('Pucca house ownership status.');
  }

  if (answers.livesInKutchaHouse === true) {
    satisfied.push('Currently living in kutcha shelter with kutcha walls and roof.');
  } else if (answers.livesInKutchaHouse === false && answers.ownsPuccaHouse === false) {
    missing.push('Physical verification of kutcha shelter by Gram Sabha / Awaas+ survey needed.');
  }

  // Exclusions: Vehicle & Govt Job
  if (answers.ownsMotorizedFourWheelerOrTractor === true) {
    notSatisfied.push('Households owning motorized 4-wheelers, mechanized boats, or agricultural tractors are excluded.');
  } else if (answers.ownsMotorizedFourWheelerOrTractor === false) {
    satisfied.push('Does not own motorized 4-wheelers or agricultural tractors.');
  }

  if (answers.isGovtEmployeeOrPensionerInFamily === true) {
    notSatisfied.push('Households with any member as government servant or income tax payer are excluded.');
  }

  let result: AssessmentResult = 'appears_eligible';
  let explanation = '';

  if (notSatisfied.length > 0) {
    result = 'criteria_not_met';
    explanation = notSatisfied[0];
  } else if (missing.length > 0) {
    result = 'insufficient_information';
    explanation = `Physical verification required: ${missing.join(', ')}`;
  } else {
    explanation = 'Citizen appears eligible for ₹1,20,000 (plains) / ₹1,30,000 (hilly) financial housing assistance + 90-95 days unskilled MGNREGA wages.';
  }

  return {
    schemeId: 'pmay-g',
    schemeName: 'Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)',
    schemeNameHi: 'प्रधानमंत्री आवास योजना - ग्रामीण',
    schemeNameTe: 'ప్రధాన మంత్రి ఆవాస్ యోజన - గ్రామీణ',
    category: 'Housing',
    result,
    criteriaSatisfied: satisfied,
    criteriaNotSatisfied: notSatisfied,
    missingInformation: missing,
    explanation,
    requiredDocuments: [
      'Aadhaar Card',
      'Active Bank Account Details (DBT compliant)',
      'MGNREGA Job Card Number',
      'Consent letter from Gram Sabha or land ownership title',
    ],
    officialUrl: 'https://pmayg.nic.in',
    rulesVersion: '2024.1',
    lastReviewedAt: '2026-10-15',
  };
}

/**
 * 4. MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)
 * 100 days statutory wage employment
 */
export function evaluateMgnrega(answers: CitizenAnswers): SchemeEvaluation {
  const satisfied: string[] = [];
  const notSatisfied: string[] = [];
  const missing: string[] = [];

  // Rural location
  if (answers.areaType === 'rural') {
    satisfied.push('Resides in rural Gram Panchayat area.');
  } else if (answers.areaType === 'urban') {
    notSatisfied.push('MGNREGA is legally restricted to rural areas under Gram Panchayat jurisdiction.');
  } else {
    missing.push('Rural residency confirmation.');
  }

  // Age restriction
  if (answers.age !== undefined) {
    if (answers.age >= 18) {
      satisfied.push('Applicant is an adult aged 18 years or above.');
    } else {
      notSatisfied.push('Applicant must be 18 years of age or older.');
    }
  } else {
    missing.push('Age verification (must be 18+).');
  }

  // Willingness for manual labor
  if (answers.willingForUnskilledManualWork === true) {
    satisfied.push('Willing to undertake unskilled physical manual labor.');
  } else if (answers.willingForUnskilledManualWork === false) {
    notSatisfied.push('Statutory guarantee requires willingness to do unskilled manual work on public infrastructure.');
  } else {
    missing.push('Willingness to undertake unskilled manual physical labor.');
  }

  let result: AssessmentResult = 'appears_eligible';
  let explanation = '';

  if (notSatisfied.length > 0) {
    result = 'criteria_not_met';
    explanation = notSatisfied[0];
  } else if (missing.length > 0) {
    result = 'insufficient_information';
    explanation = `Required criteria: ${missing.join(', ')}`;
  } else {
    explanation = 'Citizen is legally entitled to guaranteed 100 days of unskilled wage employment per household per year and a free Job Card within 15 days.';
  }

  return {
    schemeId: 'mgnrega',
    schemeName: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
    schemeNameHi: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम',
    schemeNameTe: 'మహాత్మా గాంధీ జాతీయ గ్రామీణ ఉపాధి హామీ పథకం',
    category: 'Employment',
    result,
    criteriaSatisfied: satisfied,
    criteriaNotSatisfied: notSatisfied,
    missingInformation: missing,
    explanation,
    requiredDocuments: [
      'Aadhaar Card',
      'Identity and Residence Proof (Voter Card / Ration Card)',
      'Bank / Post Office Account passbook',
      'Passport size photographs of adult members',
    ],
    officialUrl: 'https://nrega.nic.in',
    rulesVersion: '2024.1',
    lastReviewedAt: '2026-10-15',
  };
}

/**
 * 5. National Food Security Act (NFSA) - Targeted Public Distribution
 * 5 kg/person or 35 kg/family subsidized/free foodgrains
 */
export function evaluateNfsa(answers: CitizenAnswers): SchemeEvaluation {
  const satisfied: string[] = [];
  const notSatisfied: string[] = [];
  const missing: string[] = [];

  // Exclusions: Govt Job & 4-Wheeler & Tax
  if (answers.isGovtEmployeeOrPensionerInFamily === true) {
    notSatisfied.push('Families with permanent government employees are excluded from priority food security ration.');
  } else if (answers.isGovtEmployeeOrPensionerInFamily === false) {
    satisfied.push('No permanent government employment in household.');
  }

  if (answers.paysIncomeTax === true) {
    notSatisfied.push('Income tax payers are excluded from subsidized foodgrain entitlement.');
  }

  if (answers.ownsMotorizedFourWheelerOrTractor === true) {
    notSatisfied.push('Owning 4-wheeler motor vehicles exceeds standard poverty ceilings.');
  }

  // Inclusions: Income ceiling or existing card
  const hasLowIncome = answers.annualFamilyIncome !== undefined && answers.annualFamilyIncome <= 150000;
  const isBplCard = answers.rationCardCategory === 'bpl_priority' || answers.rationCardCategory === 'antyodaya_aay';

  if (isBplCard) {
    satisfied.push('Identified under Antyodaya Anna Yojana (AAY) or Priority Household (PHH) database.');
  } else if (hasLowIncome) {
    satisfied.push('Household income is within state notified priority household ceiling.');
  } else if (answers.annualFamilyIncome === undefined) {
    missing.push('Annual family income declaration or income certificate.');
  } else if (answers.annualFamilyIncome > 150000) {
    notSatisfied.push('Household annual income exceeds the priority food security eligibility ceiling.');
  }

  let result: AssessmentResult = 'appears_eligible';
  let explanation = '';

  if (notSatisfied.length > 0) {
    result = 'criteria_not_met';
    explanation = notSatisfied[0];
  } else if (missing.length > 0) {
    result = 'insufficient_information';
    explanation = `Information needed: ${missing.join(', ')}`;
  } else {
    explanation = 'Household appears eligible for 5 kg foodgrains per person per month (Priority) or 35 kg per family per month (Antyodaya) under PMGKAY.';
  }

  return {
    schemeId: 'nfsa-ration',
    schemeName: 'National Food Security Act (NFSA) - Targeted Public Distribution',
    schemeNameHi: 'राष्ट्रीय खाद्य सुरक्षा अधिनियम - सार्वजनिक वितरण प्रणाली',
    schemeNameTe: 'జాతీయ ఆహార భద్రతా చట్టం - రేషన్ కార్డు సేవలు',
    category: 'Food Security',
    result,
    criteriaSatisfied: satisfied,
    criteriaNotSatisfied: notSatisfied,
    missingInformation: missing,
    explanation,
    requiredDocuments: [
      'Aadhaar Card of all family members',
      'Proof of Residence (Electricity bill, Gram Panchayat certificate)',
      'Income Certificate issued by Tahsildar / Revenue Department',
      'Family photograph with head of household (female head prioritized)',
    ],
    officialUrl: 'https://nfsa.gov.in',
    rulesVersion: '2024.1',
    lastReviewedAt: '2026-10-15',
  };
}

/**
 * 6. Pradhan Mantri Ujjwala Yojana 2.0 (PMUY 2.0)
 * Free deposit-free LPG connection + free refill and stove
 */
export function evaluatePmUjjwala(answers: CitizenAnswers): SchemeEvaluation {
  const satisfied: string[] = [];
  const notSatisfied: string[] = [];
  const missing: string[] = [];

  // Adult female requirement
  if (answers.gender === 'female') {
    satisfied.push('Applicant is an adult woman representing the household.');
  } else if (answers.gender === 'male' || answers.gender === 'other') {
    notSatisfied.push('PM Ujjwala connections are statutorily issued exclusively in the name of an adult woman of the household.');
  } else {
    missing.push('Applicant gender (must be an adult female head/member).');
  }

  if (answers.age !== undefined) {
    if (answers.age >= 18) {
      satisfied.push('Applicant is aged 18 years or above.');
    } else {
      notSatisfied.push('Applicant must be at least 18 years of age.');
    }
  } else {
    missing.push('Age verification (18+).');
  }

  // Exclusion: Existing LPG connection
  if (answers.hasLpgConnectionInHousehold === true) {
    notSatisfied.push('No other LPG connection must exist in the same household.');
  } else if (answers.hasLpgConnectionInHousehold === false) {
    satisfied.push('Household does not currently hold any domestic LPG connection.');
  } else {
    missing.push('Existing household LPG connection check.');
  }

  // Poverty declaration / BPL
  const isEligibleCategory =
    answers.rationCardCategory === 'bpl_priority' ||
    answers.rationCardCategory === 'antyodaya_aay' ||
    answers.livesInKutchaHouse === true ||
    (answers.annualFamilyIncome !== undefined && answers.annualFamilyIncome <= 150000);

  if (isEligibleCategory) {
    satisfied.push('Household qualifies under eligible rural poor / SECC / BPL declaration criteria.');
  } else if (answers.annualFamilyIncome === undefined && answers.rationCardCategory === undefined) {
    missing.push('BPL ration card or low-income declaration.');
  } else {
    notSatisfied.push('Household must belong to identified 14-point declaration categories of poor rural households.');
  }

  let result: AssessmentResult = 'appears_eligible';
  let explanation = '';

  if (notSatisfied.length > 0) {
    result = 'criteria_not_met';
    explanation = notSatisfied[0];
  } else if (missing.length > 0) {
    result = 'insufficient_information';
    explanation = `Verification needed: ${missing.join(', ')}`;
  } else {
    explanation = 'Applicant appears eligible for a deposit-free LPG connection with ₹1,600 government financial assistance, plus free first refill cylinder and stove.';
  }

  return {
    schemeId: 'pm-ujjwala',
    schemeName: 'Pradhan Mantri Ujjwala Yojana (PMUY 2.0)',
    schemeNameHi: 'प्रधानमंत्री उज्ज्वला योजना 2.0',
    schemeNameTe: 'ప్రధాన మంత్రి ఉజ్జ్వల యోజన 2.0',
    category: 'Women & Child',
    result,
    criteriaSatisfied: satisfied,
    criteriaNotSatisfied: notSatisfied,
    missingInformation: missing,
    explanation,
    requiredDocuments: [
      'Aadhaar Card of adult female applicant',
      'Ration Card confirming family composition',
      'Bank Account Passbook (IFSC & Account number)',
      'Supplementary e-KYC',
    ],
    officialUrl: 'https://www.pmuy.gov.in',
    rulesVersion: '2024.1',
    lastReviewedAt: '2026-10-15',
  };
}

// ==============================================================================
// 2. MASTER EVALUATION & PERSISTENCE
// ==============================================================================

/**
 * Evaluate single scheme by identifier
 */
export function evaluateScheme(schemeId: string, answers: CitizenAnswers): SchemeEvaluation {
  switch (schemeId) {
    case 'pm-kisan':
      return evaluatePmKisan(answers);
    case 'ayushman-bharat':
      return evaluateAyushmanBharat(answers);
    case 'pmay-g':
      return evaluatePmayG(answers);
    case 'mgnrega':
      return evaluateMgnrega(answers);
    case 'nfsa-ration':
      return evaluateNfsa(answers);
    case 'pm-ujjwala':
      return evaluatePmUjjwala(answers);
    default:
      return {
        schemeId,
        schemeName: schemeId,
        category: 'General',
        result: 'insufficient_information',
        criteriaSatisfied: [],
        criteriaNotSatisfied: [],
        missingInformation: ['No verified rule engine mapped for this scheme ID.'],
        explanation: 'Scheme rule engine definition not available.',
        requiredDocuments: [],
        officialUrl: '',
        rulesVersion: '2024.1',
        lastReviewedAt: new Date().toISOString(),
      };
  }
}

/**
 * Evaluate all 6 national schemes simultaneously for a citizen profile
 */
export function evaluateAllSchemes(answers: CitizenAnswers): SchemeEvaluation[] {
  return [
    evaluatePmKisan(answers),
    evaluateAyushmanBharat(answers),
    evaluatePmayG(answers),
    evaluateMgnrega(answers),
    evaluateNfsa(answers),
    evaluatePmUjjwala(answers),
  ];
}

/**
 * Persist an assessment. When signed in (userId provided), records it to the
 * MongoDB-backed API; otherwise keeps a local-only record. Never claims a
 * server save that did not happen.
 */
export async function saveAssessmentRecord(
  evaluation: SchemeEvaluation,
  answers: CitizenAnswers,
  userId?: string
): Promise<boolean> {
  // Server persistence only when a session exists. The server enforces the real
  // owner from the session cookie; userId here just gates whether we attempt it.
  if (userId) {
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: evaluation.schemeId,
          schemeName: evaluation.schemeName,
          schemeRuleVersion: evaluation.rulesVersion,
          answers,
          result: evaluation.result,
          explanation: evaluation.explanation,
          missingCriteria: evaluation.missingInformation,
          requiredDocuments: evaluation.requiredDocuments,
          officialUrl: evaluation.officialUrl,
        }),
      });
      if (res.ok) {
        return true;
      }
      // If the server rejects (e.g. session expired), fall through to local so
      // the user still has a record — but do not report it as a server save.
    } catch {
      // Fall through to local demo storage.
    }
  }

  // Guest / offline fallback (localStorage)
  try {
    if (typeof window !== 'undefined') {
      const existingStr = localStorage.getItem('schematrix_saved_assessments') || '[]';
      const existing = JSON.parse(existingStr);
      existing.unshift({
        id: `eval_${Date.now()}`,
        schemeId: evaluation.schemeId,
        schemeName: evaluation.schemeName,
        result: evaluation.result,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('schematrix_saved_assessments', JSON.stringify(existing.slice(0, 20)));
      return true;
    }
  } catch {}

  return false;
}
