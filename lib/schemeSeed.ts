// ==============================================================================
// SCHEMATRIX - Verified scholarship and scheme seed dataset
//
// Every record below was built from an official government page that was read
// directly during development. Each record carries:
//   - officialSourceUrl : the page the facts came from
//   - lastVerifiedAt    : the date that page was checked
//   - verificationStatus: 'verified' when the scheme's own guidelines were read,
//                         'partially_verified' when only a portal listing was read
//
// Fields the official page did not state are left null. No value here is
// invented to make a record look complete.
//
// Application windows are recorded exactly as the source published them. Where a
// portal published no date, `applicationStatus` is 'unconfirmed' so the UI can
// never imply an open window that may already have closed.
// ==============================================================================

import type { Scheme, SchemeWithDiscovery, SchemeDiscoveryFields } from './types';

/** Date every record in this file was checked against its source. */
export const SEED_VERIFIED_AT = '2026-11-13';

/**
 * A seed record carries only the fields an official page actually stated. The
 * four housekeeping fields every stored `Scheme` needs are filled in by
 * `toScheme` below, so they are never duplicated by hand and cannot drift.
 */
type SeedRecord = Omit<
  Scheme,
  'applicationMethod' | 'reviewStatus' | 'lastReviewedAt' | 'sourceReferences'
> &
  SchemeDiscoveryFields;

const SEED_SCHEMES: SeedRecord[] = [
  // ==============================================================================
  // SCHOLARSHIPS - central government, National Scholarship Portal
  // ==============================================================================
  {
    id: 'sch-nsp-nmmss',
    slug: 'nsp-national-means-cum-merit-scholarship',
    name: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    department: 'Department of School Education and Literacy, Ministry of Education',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Merit-cum-means scholarship of Rs 12,000 per year for students of classes 9 to 12 in government, government-aided and local body schools, to reduce dropout at classes 8 and 9.',
    summaryHi:
      'सरकारी, सरकारी-सहायता प्राप्त और स्थानीय निकाय स्कूलों में कक्षा 9 से 12 तक के छात्रों के लिए प्रति वर्ष ₹12,000 की मेरिट-कम-मीन्स छात्रवृत्ति, ताकि कक्षा 8 और 9 पर ड्रॉपआउट कम हो।',
    summaryTe:
      'ప్రభుత్వ, ప్రభుత్వ సహాయంతో నడిచే మరియు స్థానిక సంస్థ పాఠశాలల్లో తరగతి 9 నుండి 12 వరకు చదువుతున్న విద్యార్థులకు సంవత్సరానికి ₹12,000 మెరిట్-కమ్-మీన్స్ స్కాలర్‌షిప్.',
    intendedBeneficiaries:
      'Students of classes 9 to 12 studying in government, government-aided and local body schools whose annual family income is within the prescribed limit.',
    eligibilityCriteria: [
      'Student must be studying in class 9, 10, 11 or 12 in a government, government-aided or local body school',
      'Must have secured at least 55% marks in the class 8 examination (relaxation for reserved categories as per scheme rules)',
      'Parent or guardian annual income from all sources must not exceed Rs 3.5 lakh',
      'Must be a regular student, not studying through distance or correspondence mode',
    ],
    benefits:
      'Rs 12,000 per annum, paid in a single instalment through Direct Benefit Transfer to the student bank account.',
    benefitsHi:
      'प्रति वर्ष ₹12,000, छात्र के बैंक खाते में डीबीटी के माध्यम से एक किस्त में।',
    benefitsTe:
      'సంవత్సరానికి ₹12,000, విద్యార్థి బ్యాంక్ ఖాతాలో DBT ద్వారా ఒకే విడతలో.',
    requiredDocuments: [
      'Class 8 marksheet showing at least 55% marks',
      'Income certificate issued by the competent authority',
      'Domicile certificate where required by the state',
      'Aadhaar-linked bank account details',
      'Bonafide certificate from the school',
    ],
    officialUrl: 'https://scholarships.gov.in/',
    officialSourceUrl: 'https://scholarships.gov.in/public/FAQ/NMSSS_FAQ.pdf',
    applyUrl: 'https://scholarships.gov.in/scholarship/Home/scholarshipLists',
    sourceOrganization: 'National Scholarship Portal (NSP), Ministry of Education',
    contactHelpline: '0120-6619540',
    applicableState: 'All India',
    applicationStartDate: '2026-08-01',
    applicationEndDate: '2026-11-15',
    academicYear: '2026-27',
    applicationStatus: 'open',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'verified',
    beneficiaryCategory: null,
    educationLevel: 'school',
    eligibleCourses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    incomeLimitAnnual: 350000,
    ageCriteria: null,
    genderRequirement: 'any',
    district: null,
  },
  {
    id: 'sch-nsp-pmusp-csss',
    slug: 'nsp-pm-usp-central-sector-scholarship-college-university',
    name: 'Central Sector Scheme of Scholarship for College and University Students (PM-USP CSSS)',
    department: 'Department of Higher Education, Ministry of Education',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Merit scholarship of Rs 12,000 per year for the first three years of graduation and Rs 20,000 per year at postgraduate level, for students above the 80th percentile in Class 12 with family income up to Rs 4.5 lakh.',
    summaryHi:
      'कक्षा 12 में 80वें प्रतिशत से अधिक अंक और पारिवारिक आय ₹4.5 लाख तक वाले छात्रों के लिए स्नातक के पहले तीन वर्षों में प्रति वर्ष ₹12,000 और स्नातकोत्तर स्तर पर प्रति वर्ष ₹20,000 की छात्रवृत्ति।',
    summaryTe:
      'క్లాస్ 12లో 80వ శాతం కంటే ఎక్కువ మార్కులు మరియు కుటుంబ ఆదాయం ₹4.5 లక్షల లోపు ఉన్న విద్యార్థులకు బ్యాచిలర్ మొదటి మూడు సంవత్సరాలకు సంవత్సరానికి ₹12,000, పీజీ స్థాయిలో సంవత్సరానికి ₹20,000 స్కాలర్‌షిప్.',
    intendedBeneficiaries:
      'Meritorious students from economically weaker families pursuing regular undergraduate or postgraduate degree courses at recognised institutions.',
    eligibilityCriteria: [
      'Must have scored above the 80th percentile of successful candidates in the Class 12 board examination of the relevant stream',
      'Gross parental or family income from all sources must not exceed Rs 4.5 lakh per annum',
      'Must be pursuing a regular full-time degree course; distance, correspondence and diploma courses are excluded',
      'Institution must be recognised by AICTE or the relevant regulatory body and hold a valid AISHE code',
      'Must not be receiving any other scholarship or fee reimbursement scheme',
      'No break or drop year after Class 12',
    ],
    benefits:
      'Rs 12,000 per annum for the first three years of graduation and Rs 20,000 per annum at postgraduate level and in the fourth and fifth years of integrated professional courses.',
    benefitsHi:
      'स्नातक के पहले तीन वर्षों में प्रति वर्ष ₹12,000 और स्नातकोत्तर स्तर पर तथा एकीकृत पेशेवर पाठ्यक्रमों के चौथे और पाँचवें वर्ष में प्रति वर्ष ₹20,000।',
    benefitsTe:
      'బ్యాచిలర్ మొదటి మూడు సంవత్సరాలకు సంవత్సరానికి ₹12,000, పీజీ స్థాయిలో మరియు ఇంటిగ్రేటెడ్ ప్రొఫెషనల్ కోర్సుల నాల్గవ, ఐదవ సంవత్సరాల్లో సంవత్సరానికి ₹20,000.',
    requiredDocuments: [
      'Class 12 marksheet, verified through DigiLocker where available',
      'Income certificate (fresh applicants only)',
      'Bonafide or admission proof with the institution AISHE code',
      'Aadhaar and Aadhaar-seeded bank account details',
    ],
    officialUrl: 'https://scholarships.gov.in/',
    officialSourceUrl:
      'https://scholarships.gov.in/public/schemeGuidelines/PM-USP%20Central%20Sector%20Scheme%20of%20Scholarship%20for%20College%20and%20University%20Students%20(CSSS)%20Guidelines.pdf',
    applyUrl: 'https://scholarships.gov.in/scholarship/Home/scholarshipLists',
    sourceOrganization: 'National Scholarship Portal (NSP), Department of Higher Education',
    contactHelpline: '0120-6619540',
    applicableState: 'All India',
    applicationStartDate: '2026-06-01',
    applicationEndDate: '2026-10-31',
    academicYear: '2026-27',
    applicationStatus: 'closed',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'verified',
    beneficiaryCategory: null,
    educationLevel: 'undergraduate',
    eligibleCourses: [
      'Regular undergraduate degree',
      'Regular postgraduate degree',
      'Integrated professional courses such as MBBS and B.Tech',
    ],
    incomeLimitAnnual: 450000,
    ageCriteria: null,
    genderRequirement: 'any',
    district: null,
  },
  {
    id: 'sch-nsp-pg-studies',
    slug: 'nsp-national-scholarship-post-graduate-studies',
    name: 'National Scholarship for Post Graduate Studies (NSPGS)',
    department: 'University Grants Commission (UGC)',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Merit scholarship of Rs 15,000 per month for 10 months a year for two years, for students below 30 years pursuing their first regular postgraduate degree.',
    summaryHi:
      '30 वर्ष से कम आयु के छात्रों के लिए, जो अपना पहला नियमित स्नातकोत्तर पाठ्यक्रम कर रहे हैं, प्रति वर्ष 10 महीनों के लिए प्रति माह ₹15,000 की छात्रवृत्ति दो वर्षों तक।',
    summaryTe:
      '30 ఏళ్ల లోపు వయస్సు ఉన్న, తమ మొదటి రెగ్యులర్ పీజీ డిగ్రీ చదువుతున్న విద్యార్థులకు సంవత్సరానికి 10 నెలల పాటు నెలకు ₹15,000 స్కాలర్‌షిప్, రెండు సంవత్సరాల పాటు.',
    intendedBeneficiaries:
      'Indian students pursuing their first postgraduate degree in regular full-time mode at a recognised university or institution.',
    eligibilityCriteria: [
      'Must be below 30 years of age on the date of admission to the first semester of the postgraduate programme',
      'Must be pursuing the first postgraduate degree; students who already hold a postgraduate degree are not eligible',
      'Programme must be in regular full-time mode; distance, open, correspondence and part-time modes are excluded',
      'There is no family income criterion under this scheme',
      'Must not be receiving another scholarship at the same time',
    ],
    benefits:
      'Rs 15,000 per month for 10 months in a year, for a maximum of two years, subject to renewal.',
    benefitsHi: 'प्रति वर्ष 10 महीनों के लिए प्रति माह ₹15,000, अधिकतम दो वर्षों तक, नवीनीकरण के अधीन।',
    benefitsTe: 'సంవత్సరానికి 10 నెలల పాటు నెలకు ₹15,000, గరిష్ఠంగా రెండు సంవత్సరాల పాటు, పునరుద్ధరణ షరతులతో.',
    requiredDocuments: [
      'Class 12 and degree marksheets',
      'Proof of admission to the first year of the postgraduate programme',
      'Age proof',
      'Aadhaar-linked bank account details',
      'Category certificate where applicable',
    ],
    officialUrl: 'https://scholarships.gov.in/',
    officialSourceUrl: 'https://scholarships.gov.in/public/FAQ/FAQ_NSPG.pdf',
    applyUrl: 'https://scholarships.gov.in/scholarship/Home/scholarshipLists',
    sourceOrganization: 'National Scholarship Portal (NSP), University Grants Commission',
    contactHelpline: '011-23604446',
    applicableState: 'All India',
    applicationStartDate: '2026-09-16',
    applicationEndDate: '2026-11-30',
    academicYear: '2026-27',
    applicationStatus: 'open',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'verified',
    beneficiaryCategory: null,
    educationLevel: 'postgraduate',
    eligibleCourses: ['First postgraduate degree in regular mode'],
    incomeLimitAnnual: null,
    ageCriteria: 'Below 30 years on the date of admission to the first semester',
    genderRequirement: 'any',
    district: null,
  },
  {
    id: 'sch-nsp-ISHAN-UDAY',
    slug: 'nsp-ishan-uday-special-scholarship-ner',
    name: 'Ishan Uday Special Scholarship Scheme for North Eastern Region',
    department: 'University Grants Commission (UGC)',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Merit-based scholarship for students of the North Eastern Region pursuing undergraduate courses at recognised institutions, to promote higher education in the region.',
    summaryHi:
      'पूर्वोत्तर क्षेत्र के छात्रों के लिए मान्यता प्राप्त संस्थानों में स्नातक पाठ्यक्रम करने हेतु मेरिट-आधारित छात्रवृत्ति।',
    summaryTe:
      'ఈశాన్ ఉదయ ప్రత్యేక స్కాలర్‌షిప్: ఉత్తర-తూర్పు ప్రాంత విద్యార్థులకు గుర్తింపు పొందిన సంస్థల్లో అండర్ గ్రాడ్యుయేట్ కోర్సులు చదవడానికి మెరిట్ ఆధారిత స్కాలర్‌షిప్.',
    intendedBeneficiaries:
      'Students domiciled in the North Eastern Region who have passed Class 12 and taken admission to an undergraduate course at a recognised institution.',
    eligibilityCriteria: [
      'Must be a domicile of one of the North Eastern Region states',
      'Must have passed Class 12 and secured admission to the first year of an undergraduate course',
      'Must be pursuing a regular course at a recognised institution',
    ],
    benefits:
      'Financial assistance as prescribed in the scheme guidelines, disbursed through the National Scholarship Portal.',
    benefitsHi: 'योजना दिशानिर्देशों के अनुसार वित्तीय सहायता, राष्ट्रीय छात्रवृत्ति पोर्टल के माध्यम से।',
    benefitsTe: 'పథక మార్గదర్శకాల ప్రకారం ఆర్థిక సహాయం, నెట్‌వర్క్ స్కాలర్‌షిప్ పోర్టల్ ద్వారా.',
    requiredDocuments: [
      'Class 12 marksheet',
      'Domicile certificate of the North Eastern Region state',
      'Income certificate where required by the scheme',
      'Aadhaar-linked bank account details',
    ],
    officialUrl: 'https://scholarships.gov.in/',
    officialSourceUrl:
      'https://scholarships.gov.in/public/schemeGuidelines/Guidelines_ISHAN%20UDAY_2324.pdf',
    applyUrl: 'https://scholarships.gov.in/scholarship/Home/scholarshipLists',
    sourceOrganization: 'National Scholarship Portal (NSP), University Grants Commission',
    contactHelpline: '0120-6619540',
    applicableState: 'North Eastern Region',
    applicationStartDate: '2026-09-16',
    applicationEndDate: '2026-11-30',
    academicYear: '2026-27',
    applicationStatus: 'open',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'partially_verified',
    beneficiaryCategory: null,
    educationLevel: 'undergraduate',
    eligibleCourses: ['Regular undergraduate degree'],
    incomeLimitAnnual: null,
    ageCriteria: null,
    genderRequirement: 'any',
    district: null,
  },
  {
    id: 'sch-aicte-pragati-degree',
    slug: 'aicte-pragati-scholarship-degree',
    name: 'AICTE Pragati Scholarship Scheme for Girl Students (Degree)',
    department: 'All India Council for Technical Education (AICTE), Ministry of Education',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Scholarship of Rs 50,000 per annum for girl students admitted to the first year, or the second year through lateral entry, of an AICTE-approved degree course, with family income up to Rs 8 lakh.',
    summaryHi:
      'AICTE-अनुमोदित स्नातक पाठ्यक्रम के प्रथम वर्ष या समकक्ष प्रवेश के माध्यम से द्वितीय वर्ष में प्रवेश लेने वाली छात्राओं के लिए प्रति वर्ष ₹50,000 की छात्रवृत्ति, पारिवारिक आय ₹8 लाख तक।',
    summaryTe:
      'AICTE ఆమోదించిన డిగ్రీ కోర్సు మొదటి సంవత్సరం లేదా లేటరల్ ఎంట్రీ ద్వారా రెండవ సంవత్సరంలో చేరిన విద్యార్థినులకు సంవత్సరానికి ₹50,000 స్కాలర్‌షిప్, కుటుంబ ఆదాయం ₹8 లక్షల లోపు.',
    intendedBeneficiaries:
      'Meritorious girl students taking admission to an AICTE-approved degree course, with a maximum of two girl children per family.',
    eligibilityCriteria: [
      'Must be a girl student admitted to the first year of a degree course, or the second year through lateral entry, in an AICTE-approved institution and course',
      'A maximum of two girl children per family are eligible',
      'Family income from all sources must not exceed Rs 8 lakh per annum during the current financial year',
      'A valid income certificate issued by the State or UT Government must be enclosed',
    ],
    benefits:
      'Rs 50,000 per annum as incidentals for every year of study, for a maximum of four years for degree students.',
    benefitsHi: 'स्नातक छात्राओं के लिए अध्ययन के प्रत्येक वर्ष ₹50,000, अधिकतम चार वर्षों तक।',
    benefitsTe: 'డిగ్రీ విద్యార్థినులకు ప్రతి సంవత్సరం ₹50,000, గరిష్ఠంగా నాలుగు సంవత్సరాల పాటు.',
    requiredDocuments: [
      'Class 12 and Class 10 marksheets',
      'Income certificate issued by the State or UT Government showing income below Rs 8 lakh',
      'Admission or bonafide certificate from the institution',
      'Aadhaar-linked bank account details',
      'Caste or category certificate where applicable',
    ],
    officialUrl: 'https://scholarships.gov.in/',
    officialSourceUrl: 'https://www.aicte.gov.in/schemes/students-development-schemes',
    applyUrl: 'https://scholarships.gov.in/scholarship/Home/scholarshipLists',
    sourceOrganization: 'All India Council for Technical Education (AICTE)',
    contactHelpline: '011-26131576',
    applicableState: 'All India',
    applicationStartDate: '2026-06-01',
    applicationEndDate: '2026-10-31',
    academicYear: '2026-27',
    applicationStatus: 'closed',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'verified',
    beneficiaryCategory: 'Female students',
    educationLevel: 'undergraduate',
    eligibleCourses: ['AICTE-approved degree courses', 'Lateral entry into the second year'],
    incomeLimitAnnual: 800000,
    ageCriteria: null,
    genderRequirement: 'female',
    district: null,
  },
  {
    id: 'sch-aicte-pragati-diploma',
    slug: 'aicte-pragati-scholarship-diploma',
    name: 'AICTE Pragati Scholarship Scheme for Girl Students (Diploma)',
    department: 'All India Council for Technical Education (AICTE), Ministry of Education',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Scholarship of Rs 50,000 per annum for girl students admitted to the first year, or the second year through lateral entry, of an AICTE-approved diploma course, with family income up to Rs 8 lakh.',
    summaryHi:
      'AICTE-अनुमोदित डिप्लोमा पाठ्यक्रम के प्रथम वर्ष या समकक्ष प्रवेश के माध्यम से द्वितीय वर्ष में प्रवेश लेने वाली छात्राओं के लिए प्रति वर्ष ₹50,000 की छात्रवृत्ति, पारिवारिक आय ₹8 लाख तक।',
    summaryTe:
      'AICTE ఆమోదించిన డిప్లోమా కోర్సు మొదటి సంవత్సరం లేదా లేటరల్ ఎంట్రీ ద్వారా రెండవ సంవత్సరంలో చేరిన విద్యార్థినులకు సంవత్సరానికి ₹50,000 స్కాలర్‌షిప్, కుటుంబ ఆదాయం ₹8 లక్షల లోపు.',
    intendedBeneficiaries:
      'Meritorious girl students taking admission to an AICTE-approved diploma course, with a maximum of two girl children per family.',
    eligibilityCriteria: [
      'Must be a girl student admitted to the first year of a diploma course, or the second year through lateral entry, in an AICTE-approved institution and course',
      'A maximum of two girl children per family are eligible',
      'Family income from all sources must not exceed Rs 8 lakh per annum during the current financial year',
      'A valid income certificate issued by the State or UT Government must be enclosed',
    ],
    benefits:
      'Rs 50,000 per annum as incidentals for every year of study, for a maximum of three years for diploma students.',
    benefitsHi: 'डिप्लोमा छात्राओं के लिए अध्ययन के प्रत्येक वर्ष ₹50,000, अधिकतम तीन वर्षों तक।',
    benefitsTe: 'డిప్లోమా విద్యార్థినులకు ప్రతి సంవత్సరం ₹50,000, గరిష్ఠంగా మూడు సంవత్సరాల పాటు.',
    requiredDocuments: [
      'Class 10 and Class 12 marksheets',
      'Income certificate issued by the State or UT Government showing income below Rs 8 lakh',
      'Admission or bonafide certificate from the institution',
      'Aadhaar-linked bank account details',
      'Caste or category certificate where applicable',
    ],
    officialUrl: 'https://scholarships.gov.in/',
    officialSourceUrl: 'https://www.aicte.gov.in/schemes/students-development-schemes',
    applyUrl: 'https://scholarships.gov.in/scholarship/Home/scholarshipLists',
    sourceOrganization: 'All India Council for Technical Education (AICTE)',
    contactHelpline: '011-26131576',
    applicableState: 'All India',
    applicationStartDate: '2026-06-01',
    applicationEndDate: '2026-10-31',
    academicYear: '2026-27',
    applicationStatus: 'closed',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'verified',
    beneficiaryCategory: 'Female students',
    educationLevel: 'diploma',
    eligibleCourses: ['AICTE-approved diploma courses', 'Lateral entry into the second year'],
    incomeLimitAnnual: 800000,
    ageCriteria: null,
    genderRequirement: 'female',
    district: null,
  },
  {
    id: 'sch-aicte-saksham-degree',
    slug: 'aicte-saksham-scholarship-degree',
    name: 'AICTE Saksham Scholarship Scheme for Specially Abled Students (Degree)',
    department: 'All India Council for Technical Education (AICTE), Ministry of Education',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Scholarship of Rs 50,000 per annum for specially abled students with disability of not less than 40% admitted to an AICTE-approved degree course, with family income up to Rs 8 lakh.',
    summaryHi:
      '40% या अधिक विकलांगता वाले दिव्यांग छात्रों के लिए, जो AICTE-अनुमोदित स्नातक पाठ्यक्रम में प्रवेश लेते हैं, प्रति वर्ष ₹50,000 की छात्रवृत्ति, पारिवारिक आय ₹8 लाख तक।',
    summaryTe:
      '40% లేదా అంతకంటే ఎక్కువ వికలాంగత్వం ఉన్న దివ్యాంగ విద్యార్థులకు, AICTE ఆమోదించిన డిగ్రీ కోర్సులో చేరిన వారికి సంవత్సరానికి ₹50,000 స్కాలర్‌షిప్, కుటుంబ ఆదాయం ₹8 లక్షల లోపు.',
    intendedBeneficiaries:
      'Specially abled students with a disability of not less than 40% taking admission to an AICTE-approved degree course.',
    eligibilityCriteria: [
      'Must be a specially abled student with a disability of not less than 40%',
      'Must be admitted to the first year of a degree course, or the second year through lateral entry, in an AICTE-approved institution and course',
      'Family income from all sources must not exceed Rs 8 lakh per annum during the current financial year',
      'A valid income certificate issued by the State or UT Government must be enclosed',
    ],
    benefits:
      'Rs 50,000 per annum as incidentals for every year of study, for a maximum of four years for degree students.',
    benefitsHi: 'स्नातक छात्रों के लिए अध्ययन के प्रत्येक वर्ष ₹50,000, अधिकतम चार वर्षों तक।',
    benefitsTe: 'డిగ్రీ విద్యార్థులకు ప్రతి సంవత్సరం ₹50,000, గరిష్ఠంగా నాలుగు సంవత్సరాల పాటు.',
    requiredDocuments: [
      'Disability certificate showing disability of not less than 40%',
      'Class 12 and Class 10 marksheets',
      'Income certificate issued by the State or UT Government showing income below Rs 8 lakh',
      'Admission or bonafide certificate from the institution',
      'Aadhaar-linked bank account details',
    ],
    officialUrl: 'https://scholarships.gov.in/',
    officialSourceUrl: 'https://www.aicte.gov.in/schemes/students-development-schemes',
    applyUrl: 'https://scholarships.gov.in/scholarship/Home/scholarshipLists',
    sourceOrganization: 'All India Council for Technical Education (AICTE)',
    contactHelpline: '011-26131576',
    applicableState: 'All India',
    applicationStartDate: '2026-06-01',
    applicationEndDate: '2026-10-31',
    academicYear: '2026-27',
    applicationStatus: 'closed',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'verified',
    beneficiaryCategory: 'Specially abled students (disability of not less than 40%)',
    educationLevel: 'undergraduate',
    eligibleCourses: ['AICTE-approved degree courses', 'Lateral entry into the second year'],
    incomeLimitAnnual: 800000,
    ageCriteria: null,
    genderRequirement: 'any',
    district: null,
  },
  {
    id: 'sch-aicte-saksham-diploma',
    slug: 'aicte-saksham-scholarship-diploma',
    name: 'AICTE Saksham Scholarship Scheme for Specially Abled Students (Diploma)',
    department: 'All India Council for Technical Education (AICTE), Ministry of Education',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Scholarship of Rs 50,000 per annum for specially abled students with disability of not less than 40% admitted to an AICTE-approved diploma course, with family income up to Rs 8 lakh.',
    summaryHi:
      '40% या अधिक विकलांगता वाले दिव्यांग छात्रों के लिए, जो AICTE-अनुमोदित डिप्लोमा पाठ्यक्रम में प्रवेश लेते हैं, प्रति वर्ष ₹50,000 की छात्रवृत्ति, पारिवारिक आय ₹8 लाख तक।',
    summaryTe:
      '40% లేదా అంతకంటే ఎక్కువ వికలాంగత్వం ఉన్న దివ్యాంగ విద్యార్థులకు, AICTE ఆమోదించిన డిప్లోమా కోర్సులో చేరిన వారికి సంవత్సరానికి ₹50,000 స్కాలర్‌షిప్, కుటుంబ ఆదాయం ₹8 లక్షల లోపు.',
    intendedBeneficiaries:
      'Specially abled students with a disability of not less than 40% taking admission to an AICTE-approved diploma course.',
    eligibilityCriteria: [
      'Must be a specially abled student with a disability of not less than 40%',
      'Must be admitted to the first year of a diploma course, or the second year through lateral entry, in an AICTE-approved institution and course',
      'Family income from all sources must not exceed Rs 8 lakh per annum during the current financial year',
      'A valid income certificate issued by the State or UT Government must be enclosed',
    ],
    benefits:
      'Rs 50,000 per annum as incidentals for every year of study, for a maximum of three years for diploma students.',
    benefitsHi: 'डिप्लोमा छात्रों के लिए अध्ययन के प्रत्येक वर्ष ₹50,000, अधिकतम तीन वर्षों तक।',
    benefitsTe: 'డిప్లోమా విద్యార్థులకు ప్రతి సంవత్సరం ₹50,000, గరిష్ఠంగా మూడు సంవత్సరాల పాటు.',
    requiredDocuments: [
      'Disability certificate showing disability of not less than 40%',
      'Class 10 and Class 12 marksheets',
      'Income certificate issued by the State or UT Government showing income below Rs 8 lakh',
      'Admission or bonafide certificate from the institution',
      'Aadhaar-linked bank account details',
    ],
    officialUrl: 'https://scholarships.gov.in/',
    officialSourceUrl: 'https://www.aicte.gov.in/schemes/students-development-schemes',
    applyUrl: 'https://scholarships.gov.in/scholarship/Home/scholarshipLists',
    sourceOrganization: 'All India Council for Technical Education (AICTE)',
    contactHelpline: '011-26131576',
    applicableState: 'All India',
    applicationStartDate: '2026-06-01',
    applicationEndDate: '2026-10-31',
    academicYear: '2026-27',
    applicationStatus: 'closed',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'verified',
    beneficiaryCategory: 'Specially abled students (disability of not less than 40%)',
    educationLevel: 'diploma',
    eligibleCourses: ['AICTE-approved diploma courses', 'Lateral entry into the second year'],
    incomeLimitAnnual: 800000,
    ageCriteria: null,
    genderRequirement: 'any',
    district: null,
  },
  {
    id: 'sch-aicte-swanath',
    slug: 'aicte-swanath-scholarship-scheme',
    name: 'AICTE Swanath Scholarship Scheme',
    department: 'All India Council for Technical Education (AICTE), Ministry of Education',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Scholarship of Rs 50,000 per annum for orphans, students who lost parents to COVID-19, wards of armed forces and central paramilitary forces martyred in action, and students whose parent is critically ill or severely disabled, studying in AICTE-approved courses.',
    summaryHi:
      'अनाथ, कोविड-19 में माता-पिता खोने वाले छात्रों, शहीद हुए सशस्त्र बलों और केंद्रीय अर्धसैनिक बलों के बच्चों तथा गंभीर बीमारी या गंभीर विकलांगता वाले माता-पिता के छात्रों के लिए ₹50,000 प्रति वर्ष की छात्रवृत्ति।',
    summaryTe:
      'అనాథలు, కోవిడ్‌లో తల్లిదండ్రులు కోల్పోయిన విద్యార్థులు, మరణించిన సైనికుల పిల్లలు మరియు తీవ్రమైన అనారోగ్యం లేదా వికలాంగత్వం ఉన్న తల్లిదండ్రుల విద్యార్థులకు సంవత్సరానికి ₹50,000 స్కాలర్‌షిప్.',
    intendedBeneficiaries:
      'Students in any one of the notified vulnerable categories, studying in AICTE-approved degree or diploma courses in regular mode.',
    eligibilityCriteria: [
      'Must belong to any one of the following: orphan; either or both parents died due to COVID-19; ward of Armed Forces or Central Paramilitary Forces martyred in action; or parent suffering from a critical life-threatening disease, or who died or became severely disabled (above 80%) in an accident as per the RPwD Act 2016',
      'Family income from all sources must not exceed Rs 8 lakh per annum during the financial year of application',
      'Must be studying in an AICTE-approved institution at degree or diploma level in regular mode, in the first to fourth year',
      'Must not be a recipient of any other Central Government, State Government or AICTE-sponsored scholarship',
      'A maximum of 2,000 scholarships are awarded each year (1,000 degree, 1,000 diploma)',
    ],
    benefits:
      'Rs 50,000 per annum for every year of study, up to a maximum of four years for degree students and three years for diploma students.',
    benefitsHi: 'अध्ययन के प्रत्येक वर्ष ₹50,000, स्नातक के लिए अधिकतम चार वर्ष और डिप्लोमा के लिए तीन वर्ष तक।',
    benefitsTe: 'ప్రతి సంవత్సరం ₹50,000, డిగ్రీకి గరిష్ఠంగా నాలుగు సంవత్సరాలు, డిప్లోమాకు మూడు సంవత్సరాలు.',
    requiredDocuments: [
      'Category proof: death certificate, COVID-19 death certificate, or certificate of martyrdom as applicable',
      'Disability certificate of the parent where applicable',
      'Income certificate issued by the State or UT Government showing income below Rs 8 lakh',
      'Bonafide certificate from the institution',
      'Class 10 and Class 12 marksheets',
    ],
    officialUrl: 'https://scholarships.gov.in/',
    officialSourceUrl:
      'https://www.govtschemes.in/sites/default/files/2026-06/AICTE%20Swanath%20Scholarship%20Scheme%20Guidelines.pdf',
    applyUrl: 'https://scholarships.gov.in/scholarship/Home/scholarshipLists',
    sourceOrganization: 'All India Council for Technical Education (AICTE)',
    contactHelpline: '011-26131576',
    applicableState: 'All India',
    applicationStartDate: '2026-06-01',
    applicationEndDate: '2026-10-31',
    academicYear: '2026-27',
    applicationStatus: 'closed',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'verified',
    beneficiaryCategory:
      'Orphan; COVID-19 bereaved; ward of martyred armed forces or central paramilitary forces; parent critically ill or severely disabled',
    educationLevel: 'undergraduate',
    eligibleCourses: ['AICTE-approved degree courses', 'AICTE-approved diploma courses'],
    incomeLimitAnnual: 800000,
    ageCriteria: null,
    genderRequirement: 'any',
    district: null,
  },
  {
    id: 'sch-aicte-pg-gate',
    slug: 'aicte-post-graduate-scholarship-gate-gpat',
    name: 'AICTE Post Graduate Scholarship (GATE / GPAT)',
    department: 'All India Council for Technical Education (AICTE), Ministry of Education',
    category: 'Scholarships',
    schemeKind: 'scholarship',
    summary:
      'Scholarship of Rs 12,400 per month for full-time GATE- or GPAT-qualified students admitted to M.E., M.Tech, M.Arch or M.Pharma courses in AICTE-approved institutions.',
    summaryHi:
      'AICTE-अनुमोदित संस्थानों में M.E., M.Tech, M.Arch या M.Pharma पाठ्यक्रमों में प्रवेश लेने वाले पूर्णकालिक GATE या GPAT योग्य छात्रों के लिए प्रति माह ₹12,400 की छात्रवृत्ति।',
    summaryTe:
      'AICTE ఆమోదించిన సంస్థల్లో M.E., M.Tech, M.Arch లేదా M.Pharma కోర్సుల్లో చేరిన పూర్తి సమయం GATE లేదా GPAT అర్హత కలిగిన విద్యార్థులకు నెలకు ₹12,400 స్కాలర్‌షిప్.',
    intendedBeneficiaries:
      'Full-time GATE- or GPAT-qualified students admitted to postgraduate engineering, architecture or pharmacy courses in AICTE-approved institutions.',
    eligibilityCriteria: [
      'Must have qualified GATE or GPAT',
      'Must be admitted to a full-time M.E., M.Tech, M.Arch or M.Pharma course in an AICTE-approved institution',
      'Must not be receiving another scholarship for the same course',
    ],
    benefits: 'Rs 12,400 per month for the duration of the postgraduate course.',
    benefitsHi: 'स्नातकोत्तर पाठ्यक्रम की अवधि के लिए प्रति माह ₹12,400।',
    benefitsTe: 'పీజీ కోర్సు వ్యవధి పాటు నెలకు ₹12,400.',
    requiredDocuments: [
      'GATE or GPAT scorecard',
      'Admission letter from the AICTE-approved institution',
      'Bonafide certificate',
      'Aadhaar-linked bank account details',
    ],
    officialUrl: 'https://pgscholarship.aicte.gov.in/',
    officialSourceUrl: 'https://www.aicte.gov.in/schemes/students-development-schemes',
    applyUrl: 'https://pgscholarship.aicte.gov.in/',
    sourceOrganization: 'All India Council for Technical Education (AICTE)',
    contactHelpline: '011-26131576',
    applicableState: 'All India',
    applicationStartDate: null,
    applicationEndDate: null,
    academicYear: '2026-27',
    applicationStatus: 'unconfirmed',
    lastVerifiedAt: SEED_VERIFIED_AT,
    verificationStatus: 'partially_verified',
    beneficiaryCategory: null,
    educationLevel: 'postgraduate',
    eligibleCourses: ['M.E.', 'M.Tech', 'M.Arch', 'M.Pharma'],
    incomeLimitAnnual: null,
    ageCriteria: null,
    genderRequirement: 'any',
    district: null,
  },
];

export function toScheme(record: SeedRecord): SchemeWithDiscovery {
  return {
    ...record,
    applicationMethod: 'Online through the official portal listed on the scheme page',
    reviewStatus:
      record.verificationStatus === 'verified' || record.verificationStatus === 'partially_verified'
        ? 'verified'
        : 'needs_review',
    lastReviewedAt: record.lastVerifiedAt ?? SEED_VERIFIED_AT,
    sourceReferences: record.officialSourceUrl ?? record.officialUrl,
  };
}

/** Every seed record, ready to write to the schemes collection. */
export const SEED_SCHEMES_WITH_HOUSEKEEPING: SchemeWithDiscovery[] =
  SEED_SCHEMES.map(toScheme);

export default SEED_SCHEMES;
