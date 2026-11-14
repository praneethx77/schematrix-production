// ==============================================================================
// SCHEMATRIX - Multilingual Internationalization (i18n) Engine
// Trilingual support for English, हिन्दी (Hindi), and తెలుగు (Telugu)
// ==============================================================================

import { SupportedLanguage } from './types';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', speechCode: 'en-IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', speechCode: 'te-IN' },
];

export const translations = {
  en: {
    // Platform Branding
    appName: 'SCHEMATRIX',
    appTagline: 'AI-Powered Indian Welfare Schemes Discovery & Public Services',
    subtitle: 'One Unified Digital Gateway for Citizen Entitlements & Government Services',
    govIndiaPortal: 'Government of India Digital Initiative',
    welcomeBack: 'Namaste',
    welcomeCitizen: 'Welcome Citizen',

    // Navigation
    home: 'Home',
    schemes: 'Schemes',
    services: 'Public Services',
    checker: 'Eligibility Assessment',
    vault: 'Document Vault',
    tracker: 'Application Tracker',
    offices: 'Nearby Offices',
    sahayak: 'AI Sahayak',
    notifications: 'Notifications',
    profile: 'Profile',
    admin: 'Admin Console',

    // Authentication
    login: 'Sign In',
    register: 'Create Account',
    logout: 'Sign Out',
    demoCitizen: 'Demo Citizen (Farmer)',
    demoAdmin: 'Demo GovTech Officer',

    // Accessibility Controls
    accessibility: 'Accessibility Tools',
    highContrast: 'High Contrast Mode',
    highContrastOn: 'High Contrast On',
    highContrastOff: 'High Contrast Off',
    textSize: 'Text Size',
    normalText: 'Normal (100%)',
    largeText: 'Large (115%)',
    xlargeText: 'Extra Large (130%)',
    voiceAudio: 'Voice Read-Aloud',
    voiceAudioOn: 'Voice Speech On',
    voiceAudioOff: 'Voice Speech Off',
    listenVoice: 'Read Aloud in Your Language',
    stopVoice: 'Stop Speaking',
    skipToContent: 'Skip to main content',
    languageSelect: 'Select Language',

    // Search & Directory
    quickSearchPlaceholder: 'Search welfare schemes, DBT subsidies, ration cards, land records...',
    searchAction: 'Search',
    allCategories: 'All Categories',
    allStates: 'All India & States',
    verifiedSource: 'Verified Official Source',
    officialSource: 'Official Source',
    lastVerifiedOn: 'Last verified on',
    locationActive: 'Location active',
    noOfficesAvailable: 'No offices available yet',
    noOfficesAvailableHint:
      'The office directory only lists offices with a traceable official source. No verified records have been published for your filters yet.',
    noOfficesFoundHint:
      'Try adjusting your search keywords, switching office types, or clearing filters to find more government offices.',
    officesSeedBadge: 'Sample Directory (Not Live)',
    officesSeedBanner:
      'These offices are bundled sample records for demonstration, not a live government feed. Distances and details are approximate. Connect Supabase with verified office data for live results.',
    needsReview: 'Awaiting Verification',
    draft: 'Draft',

    // Scheme & Service Card
    checkEligibility: 'Check Eligibility',
    viewDetails: 'View Details',
    applyNow: 'Official Portal',
    requiredDocs: 'Required Documents',
    benefits: 'Scheme Benefits',
    department: 'Department',
    category: 'Category',
    helpline: 'Helpline Number',
    deliveryTime: 'Estimated Processing Time',
    days: 'days',
    description: 'Description',
    overview: 'Overview',

    // Deterministic Eligibility
    eligible: 'Appears Eligible',
    notEligible: 'Criteria Not Met',
    insufficientInfo: 'More Information Needed',
    eligibilityNotice: 'Results are based on deterministic rules comparing user inputs against official scheme notifications.',

    // Categories
    catAgriculture: 'Agriculture & Farmers',
    catHealth: 'Health & Medical',
    catHousing: 'Housing & Shelter',
    catEmployment: 'Employment & Labor',
    catFood: 'Food Security & Ration',
    catWomenChild: 'Women & Child Welfare',
    catCertificates: 'Certificates & Land',

    // Disclaimers & General
    statusDisclaimer: 'Disclaimer: SCHEMATRIX provides verified informational discovery. Official approvals and sanctions remain under the statutory jurisdiction of respective government departments.',
    demoModeActive: 'Offline Demo Mode: Running with verified government seed dataset.',
    loading: 'Loading GovTech records...',
    saveChanges: 'Save Preferences',
    close: 'Close',
    back: 'Back',
    next: 'Next',

    // Discovery & Search
    clearSearch: 'Clear Search',
    noSchemesFound: 'No welfare schemes found matching your search or filters.',
    resetFilters: 'Reset All Filters',
    nearbyGovtOffices: 'Nearby Government Offices',
    nearbyGovtOfficesSubtitle: 'Find public offices around you using live OpenStreetMap data.',
    nearbyCached: 'Cached results',
    nearbyLive: 'Live results',
    useMyLocation: 'Use my location',
    radiusLabel: 'Radius',
    latitude: 'Latitude',
    longitude: 'Longitude',
    searchNearby: 'Search',
    nearbyHint: 'Allow location access, or enter coordinates to search a specific point.',
    nearbySearchPlaceholder: 'Search by name or locality',
    filterByDistrict: 'Filter by district',
    nearbyAll: 'All',
    nearbyGovernment: 'Government',
    nearbyMunicipal: 'Municipal',
    nearbyPanchayat: 'Panchayat',
    nearbyRevenue: 'Revenue / Taluk',
    nearbyCsc: 'Service Centre',
    nearbyPost: 'Post Office',
    nearbyHealth: 'Hospital',
    nearbyPolice: 'Police',
    nearbyBusyHint: 'The live service is busy; please retry shortly.',
    nearbyRetry: 'Retry',
    nearbySearching: 'Searching nearby offices…',
    nearbyResults: 'Showing',
    nearbyEmpty: 'No offices found nearby',
    nearbyEmptyHint: 'Try a larger radius, adjust filters, or search a different location.',
    nearbyGetStarted: 'Find offices near you',
    nearbyGetStartedHint: 'Use your current location or enter coordinates, then choose a radius to discover nearby public offices.',
    osmAttribution: 'Office data © OpenStreetMap contributors.',
    communityMapped: 'OpenStreetMap results are community-mapped and not government-verified.',
    communitySource: 'Community source',
    fetchedOn: 'Fetched on',
    locationUnavailable: 'Location is not available on this device.',
    locationDenied: 'Location permission was denied. Enter coordinates manually instead.',
    invalidCoords: 'Enter valid latitude (-90..90) and longitude (-180..180).',
    nearbyError: 'Live office discovery is temporarily unavailable. Please try again.',
    filterByState: 'Filter by State',
    showingSchemes: 'Showing Schemes',
    eligibilityCriteria: 'Detailed Eligibility Criteria',
    intendedBeneficiaries: 'Intended Beneficiaries',
    applicationMethod: 'Official Application Procedure',
    officialNotice: 'Verified Government Guidelines',
    sourceReferences: 'Official Source Guidelines',
    closeModal: 'Close Scheme Details',
    allIndia: 'All India',
    filterCategory: 'Filter by Category',
    verifiedOnly: 'Verified Schemes Only',

    // Phase 4: Deterministic Eligibility Engine
    stepDemographics: '1. Demographics & Location',
    stepOccupation: '2. Occupation & Landholding',
    stepHousing: '3. Housing & Amenities',
    stepExclusions: '4. Government Exclusions & DBT',
    stepReview: '5. Review & Submit',
    retakeAssessment: 'Retake Assessment',
    assessmentResults: 'Eligibility Assessment Results',
    criteriaSatisfied: 'Criteria Satisfied',
    criteriaNotSatisfied: 'Criteria Not Satisfied',
    missingInfoNotice: 'Missing Information',
    appearsEligibleCount: 'Appears Eligible',
    criteriaNotMetCount: 'Criteria Not Met',
    moreInfoCount: 'More Info Needed',
    evaluateAllSchemes: 'Assess All 6 National Schemes',
    assessmentDisclaimer: 'Statutory Disclaimer: This deterministic assessment compares your inputs against verified government criteria. Official entitlement sanctions remain under the legal jurisdiction of respective government departments.',
    selectOption: 'Select an option',
    yesOption: 'Yes',
    noOption: 'No',
    notSureOption: 'Not Sure / Need to Check',
    previousStep: 'Previous Step',
    nextStep: 'Next Step',
    submitAssessment: 'Evaluate Eligibility',

    // Phase 5: Public Services Directory & Offices Locator
    publicServicesDir: 'Public Services Directory',
    officesLocator: 'Government Offices Near You',
    searchByServiceName: 'Search by service name, documents, department...',
    searchByOfficeName: 'Search offices by name, district, mandal...',
    filterByOfficeType: 'Filter by Office Type',
    allOfficeTypes: 'All Office Types',
    allServices: 'All Services',
    getDirections: 'Get Directions',
    openInMaps: 'Open in Maps',
    locationPermission: 'Allow location access to find nearest offices',
    enableLocation: 'Use My Location',
    manualLocation: 'Select Location Manually',
    gpsUnavailable: 'Location access denied or unavailable. Using manual search.',
    applicationFee: 'Application Fee',
    processingTime: 'Processing Time',
    offlineLocation: 'Apply In Person At',
    viewAllServices: 'View All Services',
    relatedServices: 'Related Services',
    availableServicesAtOffice: 'Services Available Here',
    verifiedData: 'Verified Government Data',
    unverifiedData: 'Directory Entry (Unverified)',
    noOfficesFound: 'No offices found matching your location or filters.',
    noServicesFound: 'No services found matching your search.',
    distanceKm: 'km away',
    workingHours: 'Working Hours',
    contactNumber: 'Contact Number',
    officeType: 'Office Type',
    selectState: 'Select State',
    selectDistrict: 'Enter District',
    locatingYou: 'Locating you...',
    officeLocatorDisclaimer: 'Office data sourced from official government directories. Contact details subject to change. Always verify before visiting.',
    servicesDisclaimerNote: 'All service information is based on official government sources. Fees and timelines are indicative and may vary by state.',
    freeService: 'Free of Charge',

    // Office Types
    officeTypeGramPanchayat: 'Gram Panchayat',
    officeTypeMandalOffice: 'Tahsildar / Mandal Office',
    officeTypeCSC: 'Common Service Center (CSC)',
    officeTypeAgriculture: 'Agriculture Office',
    officeTypeHealth: 'Health Center / Hospital',
    officeTypePostOffice: 'Post Office',

    // Service Categories
    catEducation: 'Education & Scholarships',
    catLocalGovt: 'Local Government & Panchayat',

    // Location & Distance
    sortByDistance: 'Sort by Distance',

    // Phase 6: AI Sahayak, Document Vault, Authentication
    sahayakDemoBadge: 'Offline Demo Assistant',
    sahayakLiveAi: 'Live AI',
    sahayakBuiltIn: 'Built-in dataset',
    sahayakPlaceholder: 'Ask about schemes, eligibility, documents, or offices...',
    sahayakDisclaimer:
      'Live AI is not configured, so answers come from the built-in verified dataset. Set GEMINI_API_KEY to enable live AI.',
    send: 'Send',

    vaultAddDocument: 'Add Document',
    vaultTitle: 'Document Title',
    vaultTitlePlaceholder: 'e.g. Aadhaar Card - Ramesh Kumar',
    vaultFile: 'File (optional)',
    vaultFileHint:
      'Metadata is saved on the server. File bytes are not stored unless an object store is configured.',
    vaultNotes: 'Notes',
    vaultNotesPlaceholder: 'Optional notes about this document',
    vaultSave: 'Save Document',
    vaultUploading: 'Saving...',
    vaultMyDocuments: 'My Documents',
    vaultItems: 'items',
    vaultEmpty: 'No documents yet. Add your first document to get started.',
    vaultDelete: 'Delete document',
    vaultDownload: 'Download document',
    vaultDownloadFailed: 'Download failed. Please try again.',
    vaultSecureBadge: 'Secure Remote Storage',
    vaultDemoBadge: 'Metadata Storage',
    vaultDemoBanner:
      'Document metadata is stored securely on the server. File contents require a configured object store and are not uploaded yet.',
    vaultSignInRequired: 'Please sign in to use your Document Vault.',
    vaultTitleRequired: 'Document title is required.',
    vaultUploadFailed: 'Upload failed. Please try again.',
    vaultDemoSaved:
      'Document metadata saved. File bytes are not stored on the server (no object store configured).',
    vaultRemoteSaved: 'Document uploaded and saved securely.',
    vaultMetadataSaved: 'Document metadata saved (no file attached).',

    authTitle: 'Sign In to SCHEMATRIX',
    authSubtitle: 'Access your saved assessments, document vault, and personalized services.',
    optional: 'optional',
    authMethodEmail: 'Email',
    authMethodMobile: 'Mobile OTP',
    authPhone: 'Mobile Number',
    authPhonePlaceholder: '10-digit mobile number',
    authOtpLabel: 'Enter OTP',
    authOtpPlaceholder: '6-digit code',
    authSendCode: 'Send Code',
    authVerify: 'Verify & Sign In',
    authOtpSent: 'Verification code sent. Enter the 6-digit code to continue.',
    authOtpResent: 'A new code has been sent.',
    authChangePhone: 'Change number',
    authResendCode: 'Resend code',
    authResendIn: 'Resend in',
    authSecureBadge: 'Secured with hashed credentials and HTTP-only sessions.',
    authSupabaseBadge: 'Secure Account (Hashed)',
    authSetupTitle: 'Authentication Not Configured',
    authSetupMessage: 'Supabase authentication is not set up yet, so live sign-in is unavailable. To enable real accounts, configure Supabase and add your project credentials.',
    authSetupStep1: 'Create a Supabase project and run supabase/schema.sql.',
    authSetupStep2: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    authSetupStep3: 'Restart the app to enable sign in and sign up.',
    authFullName: 'Full Name',
    authFullNamePlaceholder: 'Your full name',
    authEmail: 'Email',
    authEmailPlaceholder: 'you@example.com',
    authPassword: 'Password',
    authPasswordPlaceholder: 'At least 6 characters',
    authSuccess: 'Signed in successfully.',
    authDemoSuccess: 'Signed in to a local demo session (no server account created).',
    authFailed: 'Authentication failed. Please check your details.',
    authSignedOut: 'You have been signed out.',
    authDemoUserBadge: 'Demo session — this is not a real server account.',
    sahayakReplyLanguage: 'Reply language',
    sahayakReplyLanguageAuto: 'Same as my question',
    sahayakReplyLanguageAutoHint: 'Replies follow the language you write in.',
    sahayakListening: 'Listening…',
    sahayakListeningHint: 'Speak now. Tap the microphone again to stop.',
    sahayakStopListening: 'Stop listening',
    sahayakStartListening: 'Speak your question',
    sahayakCancelListening: 'Cancel',
    sahayakMicDenied:
      'Microphone access was blocked. Allow microphone permission in your browser settings, then try again.',
    sahayakMicError: 'Speech recognition stopped unexpectedly. Please try again.',
    sahayakNoSpeech: 'No speech was detected. Please try again.',
    sahayakSpeechUnsupported:
      'Voice input is not supported in this browser. Use a recent Chrome, Edge or Safari build, or type your question instead.',
    sahayakVoiceStart: 'Start Voice Assistant',
    sahayakVoiceActive: 'Voice Assistant is active',
    sahayakVoiceEnd: 'End Voice Assistant',
    sahayakVoiceIdle: 'Tap Start, then ask your question out loud.',
    sahayakVoiceThinking: 'AI Sahayak is thinking…',
    sahayakVoiceSpeaking: 'Speaking the answer…',
    sahayakVoiceTranscript: 'You said',
    sahayakVoiceAnswer: 'AI Sahayak replied',
    sahayakPlay: 'Read aloud',
    sahayakPause: 'Pause',
    sahayakResume: 'Resume',
    sahayakStop: 'Stop',
    sahayakSpeakUnsupported:
      'Speech playback is not supported in this browser. The written answer is still available below.',
    sahayakNoVoiceInstalled:
      'No speech voice for this language is installed in your browser. The written answer is still available.',

      // Phase 9: Scheme & Scholarship Directory
      scholarships: 'Student Scholarships',
      scholarshipsTagline: 'Discover verified government scholarships and schemes',
      searchPlaceholder: 'Search schemes, scholarships, or departments',
      filterState: 'Filter by State',
      filterEducation: 'Filter by Education Level',
      filterIncome: 'Max Annual Family Income',
      onlyScholarships: 'Scholarships Only',
      statusOpen: 'Open',
      statusClosed: 'Closed',
      statusUpcoming: 'Upcoming',
      statusUnconfirmed: 'Not Confirmed',
      applySchemeNow: 'Apply Now',
      lastVerified: 'Last Verified',
      verificationStatus: 'Verification Status',
      noSchemesHint: 'Try adjusting the filters or browse all verified records.',
      studentFinder: 'Student Scholarship Finder',
      finderIntro: 'Share a few details to find matching scholarships',
      finderState: 'Your State',
      finderEducation: 'Current Education Level',
      finderCourse: 'Course or Qualification',
      finderIncome: 'Annual Family Income (Rs)',
      finderCategory: 'Category (optional)',
      finderGender: 'Gender',
      finderAge: 'Age',
      finderAcademicYear: 'Academic Year',
      findMatches: 'Find Matching Scholarships',
      potentialMatch: 'Potential match — verify final eligibility',
      schemeDetails: 'Scheme Details',
      incomeLimit: 'Income Limit',
      applicationWindow: 'Application Window',
      academicYear: 'Academic Year',
      sourceOrganisation: 'Source Organisation',
      verifiedDate: 'Verified Date',
      dbAnswerNote: 'This answer is based on verified database records, not live AI.',
  },
  hi: {
    // Platform Branding
    appName: 'स्कीमैट्रिक्स',
    appTagline: 'एआई-संचालित भारतीय सरकारी योजना खोज एवं नागरिक सेवा मंच',
    subtitle: 'नागरिक अधिकारों और सार्वजनिक सेवाओं के लिए एक एकीकृत डिजिटल मंच',
    govIndiaPortal: 'भारत सरकार डिजिटल पहल',
    welcomeBack: 'नमस्ते',
    welcomeCitizen: 'नागरिक पोर्टल में स्वागत है',

    // Navigation
    home: 'होम',
    schemes: 'सरकारी योजनाएं',
    services: 'लोक सेवाएं',
    checker: 'पात्रता जांचें',
    vault: 'दस्तावेज़ तिजोरी',
    tracker: 'आवेदन ट्रैकर',
    offices: 'निकटतम कार्यालय',
    sahayak: 'एआई सहायक',
    notifications: 'सूचनाएं',
    profile: 'प्रोफ़ाइल',
    admin: 'प्रशासन कंसोल',

    // Authentication
    login: 'साइन इन करें',
    register: 'नया खाता बनाएं',
    logout: 'लॉग आउट',
    demoCitizen: 'डेमो नागरिक (किसान)',
    demoAdmin: 'डेमो सरकारी अधिकारी',

    // Accessibility Controls
    accessibility: 'सुलभता सुविधाएं',
    highContrast: 'उच्च कंट्रास्ट मोड',
    highContrastOn: 'उच्च कंट्रास्ट चालू',
    highContrastOff: 'उच्च कंट्रास्ट बंद',
    textSize: 'अक्षर का आकार',
    normalText: 'सामान्य (100%)',
    largeText: 'बड़ा (115%)',
    xlargeText: 'अति बड़ा (130%)',
    voiceAudio: 'आवाज़ में सुनें',
    voiceAudioOn: 'ऑडियो वाचन चालू',
    voiceAudioOff: 'ऑडियो वाचन बंद',
    listenVoice: 'अपनी भाषा में बोलकर सुनें',
    stopVoice: 'बोलना बंद करें',
    skipToContent: 'सीधे मुख्य सामग्री पर जाएं',
    languageSelect: 'भाषा चुनें',

    // Search & Directory
    quickSearchPlaceholder: 'कल्याणकारी योजनाएं, डीबीटी सब्सिडी, राशन कार्ड, भू-अभिलेख खोजें...',
    searchAction: 'खोजें',
    allCategories: 'सभी श्रेणियां',
    allStates: 'अखिल भारतीय एवं राज्य',
    verifiedSource: 'सत्यापित आधिकारिक स्रोत',
    officialSource: 'आधिकारिक स्रोत',
    lastVerifiedOn: 'अंतिम सत्यापन दिनांक',
    locationActive: 'स्थान सक्रिय',
    noOfficesAvailable: 'अभी तक कोई कार्यालय उपलब्ध नहीं',
    noOfficesAvailableHint:
      'कार्यालय निर्देशिका में केवल वे कार्यालय शामिल हैं जिनका सत्यापन योग्य आधिकारिक स्रोत है। आपके फ़िल्टर के लिए अभी कोई सत्यापित रिकॉर्ड प्रकाशित नहीं है।',
    noOfficesFoundHint:
      'अधिक सरकारी कार्यालय खोजने के लिए अपनी खोज, कार्यालय प्रकार बदलें या फ़िल्टर हटाएँ।',
    officesSeedBadge: 'नमूना निर्देशिका (लाइव नहीं)',
    officesSeedBanner:
      'ये कार्यालय प्रदर्शन हेतु संग्रहीत नमूना रिकॉर्ड हैं, कोई लाइव सरकारी फ़ीड नहीं। दूरियाँ और विवरण अनुमानित हैं। लाइव परिणामों के लिए Supabase को सत्यापित कार्यालय डेटा से जोड़ें।',
    needsReview: 'समीक्षाधीन',
    draft: 'प्रारूप',

    // Scheme & Service Card
    checkEligibility: 'पात्रता जांचें',
    viewDetails: 'विवरण देखें',
    applyNow: 'आधिकारिक पोर्टल',
    requiredDocs: 'ज़रूरी दस्तावेज़',
    benefits: 'योजना के लाभ',
    department: 'मंत्रालय / विभाग',
    category: 'श्रेणी',
    helpline: 'हेल्पलाइन नंबर',
    deliveryTime: 'अनुमानित समय सीमा',
    days: 'कार्यदिवस',
    description: 'विवरण',
    overview: 'अवलोकन',

    // Deterministic Eligibility
    eligible: 'संभावित पात्र',
    notEligible: 'शर्तें पूरी नहीं',
    insufficientInfo: 'अधूरी जानकारी',
    eligibilityNotice: 'परिणाम आधिकारिक सरकारी दिशा-निर्देशों के आधार पर स्व-मूल्यांकन सहायता हैं।',

    // Categories
    catAgriculture: 'कृषि एवं किसान कल्याण',
    catHealth: 'स्वास्थ्य एवं चिकित्सा',
    catHousing: 'आवास एवं पुनर्वास',
    catEmployment: 'रोजगार एवं श्रम',
    catFood: 'खाद्य सुरक्षा एवं राशन',
    catWomenChild: 'महिला एवं बाल विकास',
    catCertificates: 'प्रमाण पत्र एवं भू-अभिलेख',

    // Disclaimers & General
    statusDisclaimer: 'अस्वीकरण: स्कीमैट्रिक्स सत्यापित सूचनात्मक मार्गदर्शन प्रदान करता है। आधिकारिक मंजूरी संबंधित सरकारी विभागों के अधिकार क्षेत्र में है।',
    demoModeActive: 'डेमो मोड: सत्यापित सरकारी डेटासेट के साथ सक्रिय है।',
    loading: 'डेटा लोड हो रहा है...',
    saveChanges: 'प्राथमिकताएं सुरक्षित करें',
    close: 'बंद करें',
    back: 'पीछे जाएं',
    next: 'आगे बढ़ें',

    // Discovery & Search
    clearSearch: 'खोज हटाएं',
    noSchemesFound: 'आपकी खोज या फ़िल्टर से मेल खाती कोई सरकारी योजना नहीं मिली।',
    resetFilters: 'सभी फ़िल्टर रीसेट करें',
    nearbyGovtOffices: 'आसपास के सरकारी कार्यालय',
    nearbyGovtOfficesSubtitle: 'लाइव OpenStreetMap डेटा का उपयोग करके अपने आसपास के सार्वजनिक कार्यालय खोजें।',
    nearbyCached: 'कैश्ड परिणाम',
    nearbyLive: 'लाइव परिणाम',
    useMyLocation: 'मेरा स्थान उपयोग करें',
    radiusLabel: 'त्रिज्या',
    latitude: 'अक्षांश',
    longitude: 'देशांतर',
    searchNearby: 'खोजें',
    nearbyHint: 'लोकेशन एक्सेस दें, या किसी विशिष्ट स्थान के लिए निर्देशांक दर्ज करें।',
    nearbySearchPlaceholder: 'नाम या क्षेत्र से खोजें',
    filterByDistrict: 'ज़िले से फ़िल्टर करें',
    nearbyAll: 'सभी',
    nearbyGovernment: 'सरकारी',
    nearbyMunicipal: 'नगरपालिका',
    nearbyPanchayat: 'पंचायत',
    nearbyRevenue: 'राजस्व / तालुक',
    nearbyCsc: 'सेवा केंद्र',
    nearbyPost: 'डाकघर',
    nearbyHealth: 'अस्पताल',
    nearbyPolice: 'पुलिस',
    nearbyBusyHint: 'लाइव सेवा व्यस्त है; कृपया थोड़ी देर बाद पुनः प्रयास करें।',
    nearbyRetry: 'पुनः प्रयास',
    nearbySearching: 'आसपास के कार्यालय खोजे जा रहे हैं…',
    nearbyResults: 'दिखाए जा रहे हैं',
    nearbyEmpty: 'आसपास कोई कार्यालय नहीं मिला',
    nearbyEmptyHint: 'बड़ी त्रिज्या आज़माएँ, फ़िल्टर बदलें, या दूसरा स्थान खोजें।',
    nearbyGetStarted: 'अपने आसपास के कार्यालय खोजें',
    nearbyGetStartedHint: 'अपना वर्तमान स्थान उपयोग करें या निर्देशांक दर्ज करें, फिर आसपास के सार्वजनिक कार्यालय खोजने के लिए त्रिज्या चुनें।',
    osmAttribution: 'कार्यालय डेटा © OpenStreetMap योगदानकर्ता।',
    communityMapped: 'OpenStreetMap परिणाम सामुदायिक रूप से मैप किए गए हैं और सरकारी रूप से सत्यापित नहीं हैं।',
    communitySource: 'सामुदायिक स्रोत',
    fetchedOn: 'प्राप्त किया गया',
    locationUnavailable: 'इस डिवाइस पर लोकेशन उपलब्ध नहीं है।',
    locationDenied: 'लोकेशन अनुमति अस्वीकृत थी। कृपया मैन्युअली निर्देशांक दर्ज करें।',
    invalidCoords: 'मान्य अक्षांश (-90..90) और देशांतर (-180..180) दर्ज करें।',
    nearbyError: 'लाइव कार्यालय खोज अस्थायी रूप से अनुपलब्ध है। कृपया पुनः प्रयास करें।',
    filterByState: 'राज्य अनुसार फ़िल्टर',
    showingSchemes: 'प्रदर्शित योजनाएं',
    eligibilityCriteria: 'विस्तृत पात्रता मानदंड',
    intendedBeneficiaries: 'लक्षित लाभार्थी समूह',
    applicationMethod: 'आधिकारिक आवेदन प्रक्रिया',
    officialNotice: 'सत्यापित सरकारी दिशा-निर्देश',
    sourceReferences: 'आधिकारिक स्रोत संदर्भ',
    closeModal: 'योजना विवरण बंद करें',
    allIndia: 'अखिल भारतीय',
    filterCategory: 'श्रेणी अनुसार फ़िल्टर',
    verifiedOnly: 'केवल सत्यापित योजनाएं',

    // Phase 4: Deterministic Eligibility Engine
    stepDemographics: '1. जनसांख्यिकी एवं स्थान',
    stepOccupation: '2. व्यवसाय एवं कृषि भूमि',
    stepHousing: '3. आवास एवं बुनियादी सुविधाएं',
    stepExclusions: '4. सरकारी अपवर्जन एवं डीबीटी',
    stepReview: '5. उत्तरों की समीक्षा करें',
    retakeAssessment: 'पुनः मूल्यांकन करें',
    assessmentResults: 'पात्रता मूल्यांकन परिणाम',
    criteriaSatisfied: 'संतुष्ट पात्रता शर्तें',
    criteriaNotSatisfied: 'असंतुष्ट शर्तें (पात्र नहीं)',
    missingInfoNotice: 'अधूरी जानकारी',
    appearsEligibleCount: 'संभावित पात्र',
    criteriaNotMetCount: 'शर्तें पूरी नहीं',
    moreInfoCount: 'अधूरी जानकारी',
    evaluateAllSchemes: 'सभी 6 राष्ट्रीय योजनाओं की जांच करें',
    assessmentDisclaimer: 'सांविधिक अस्वीकरण: यह मूल्यांकन आधिकारिक सरकारी दिशा-निर्देशों के आधार पर प्रारंभिक मार्गदर्शन है। आधिकारिक स्वीकृति संबंधित सरकारी विभागों के अधीन है।',
    selectOption: 'विकल्प चुनें',
    yesOption: 'हाँ',
    noOption: 'नहीं',
    notSureOption: 'निश्चित नहीं / जांच की आवश्यकता है',
    previousStep: 'पिछला चरण',
    nextStep: 'अगला चरण',
    submitAssessment: 'पात्रता का मूल्यांकन करें',

    // Phase 5: Public Services Directory & Offices Locator
    publicServicesDir: 'सार्वजनिक सेवा निर्देशिका',
    officesLocator: 'आपके निकट सरकारी कार्यालय',
    searchByServiceName: 'सेवा का नाम, दस्तावेज़, विभाग खोजें...',
    searchByOfficeName: 'कार्यालय, जिला, मंडल द्वारा खोजें...',
    filterByOfficeType: 'कार्यालय प्रकार के अनुसार फ़िल्टर करें',
    allOfficeTypes: 'सभी प्रकार के कार्यालय',
    allServices: 'सभी सेवाएं',
    getDirections: 'दिशा-निर्देश प्राप्त करें',
    openInMaps: 'मैप में खोलें',
    locationPermission: 'निकटतम कार्यालय खोजने के लिए स्थान पहुंच अनुमति दें',
    enableLocation: 'मेरा स्थान उपयोग करें',
    manualLocation: 'स्थान मैन्युअल रूप से चुनें',
    gpsUnavailable: 'स्थान पहुंच अस्वीकृत या अनुपलब्ध। मैन्युअल खोज का उपयोग किया जा रहा है।',
    applicationFee: 'आवेदन शुल्क',
    processingTime: 'प्रसंस्करण समय',
    offlineLocation: 'व्यक्तिगत रूप से आवेदन करने का स्थान',
    viewAllServices: 'सभी सेवाएं देखें',
    relatedServices: 'संबंधित सेवाएं',
    availableServicesAtOffice: 'यहां उपलब्ध सेवाएं',
    verifiedData: 'सत्यापित सरकारी डेटा',
    unverifiedData: 'निर्देशिका प्रविष्टि (असत्यापित)',
    noOfficesFound: 'आपके स्थान या फ़िल्टर से मेल खाता कोई कार्यालय नहीं मिला।',
    noServicesFound: 'आपकी खोज से मेल खाती कोई सेवा नहीं मिली।',
    distanceKm: 'किमी दूर',
    workingHours: 'कार्य घंटे',
    contactNumber: 'संपर्क नंबर',
    officeType: 'कार्यालय प्रकार',
    selectState: 'राज्य चुनें',
    selectDistrict: 'जिला दर्ज करें',
    locatingYou: 'आपका स्थान पता किया जा रहा है...',
    officeLocatorDisclaimer: 'कार्यालय डेटा आधिकारिक सरकारी निर्देशिकाओं से लिया गया है। संपर्क विवरण परिवर्तन के अधीन हैं। यात्रा से पहले हमेशा सत्यापित करें।',
    servicesDisclaimerNote: 'सभी सेवा जानकारी आधिकारिक सरकारी स्रोतों पर आधारित है। शुल्क और समयरेखा संकेतक हैं और राज्य के अनुसार भिन्न हो सकते हैं।',
    freeService: 'निःशुल्क',

    // Office Types
    officeTypeGramPanchayat: 'ग्राम पंचायत',
    officeTypeMandalOffice: 'तहसीलदार / मंडल राजस्व कार्यालय',
    officeTypeCSC: 'कॉमन सर्विस सेंटर (सीएससी)',
    officeTypeAgriculture: 'कृषि कार्यालय',
    officeTypeHealth: 'स्वास्थ्य केंद्र / अस्पताल',
    officeTypePostOffice: 'डाकघर',

    // Service Categories
    catEducation: 'शिक्षा एवं छात्रवृत्ति',
    catLocalGovt: 'स्थानीय सरकार एवं पंचायत',

    // Location & Distance
    sortByDistance: 'दूरी के अनुसार क्रमबद्ध करें',

    // Phase 6: AI Sahayak, Document Vault, Authentication
    sahayakDemoBadge: 'ऑफ़लाइन डेमो सहायक',
    sahayakLiveAi: 'लाइव एआई',
    sahayakBuiltIn: 'अंतर्निहित डेटासेट',
    sahayakPlaceholder: 'योजनाओं, पात्रता, दस्तावेज़ों या कार्यालयों के बारे में पूछें...',
    sahayakDisclaimer:
      'लाइव एआई कॉन्फ़िगर नहीं है, इसलिए उत्तर अंतर्निहित सत्यापित डेटासेट से आते हैं। लाइव एआई सक्षम करने के लिए GEMINI_API_KEY सेट करें।',
    send: 'भेजें',

    vaultAddDocument: 'दस्तावेज़ जोड़ें',
    vaultTitle: 'दस्तावेज़ शीर्षक',
    vaultTitlePlaceholder: 'उदा. आधार कार्ड - रमेश कुमार',
    vaultFile: 'फ़ाइल (वैकल्पिक)',
    vaultFileHint: 'मेटाडेटा सर्वर पर सहेजा जाता है। ऑब्जेक्ट स्टोर कॉन्फ़िगर होने तक फ़ाइल बाइट्स संग्रहीत नहीं होते।',
    vaultNotes: 'नोट्स',
    vaultNotesPlaceholder: 'इस दस्तावेज़ के बारे में वैकल्पिक नोट्स',
    vaultSave: 'दस्तावेज़ सहेजें',
    vaultUploading: 'सहेजा जा रहा है...',
    vaultMyDocuments: 'मेरे दस्तावेज़',
    vaultItems: 'आइटम',
    vaultEmpty: 'अभी कोई दस्तावेज़ नहीं। शुरू करने के लिए अपना पहला दस्तावेज़ जोड़ें।',
    vaultDelete: 'दस्तावेज़ हटाएँ',
    vaultDownload: 'दस्तावेज़ डाउनलोड करें',
    vaultDownloadFailed: 'डाउनलोड विफल। कृपया पुनः प्रयास करें।',
    vaultSecureBadge: 'सुरक्षित रिमोट स्टोरेज',
    vaultDemoBadge: 'मेटाडेटा स्टोरेज',
    vaultDemoBanner: 'दस्तावेज़ मेटाडेटा सर्वर पर सुरक्षित रूप से संग्रहीत है। फ़ाइल सामग्री के लिए ऑब्जेक्ट स्टोर आवश्यक है और अभी अपलोड नहीं होती।',
    vaultSignInRequired: 'अपना दस्तावेज़ तिजोरी उपयोग करने के लिए कृपया साइन इन करें।',
    vaultTitleRequired: 'दस्तावेज़ शीर्षक आवश्यक है।',
    vaultUploadFailed: 'अपलोड विफल। कृपया पुनः प्रयास करें।',
    vaultDemoSaved: 'दस्तावेज़ मेटाडेटा सहेजा गया। फ़ाइल बाइट्स सर्वर पर संग्रहीत नहीं हैं (कोई ऑब्जेक्ट स्टोर कॉन्फ़िगर नहीं)।',
    vaultRemoteSaved: 'दस्तावेज़ अपलोड और सुरक्षित रूप से सहेजा गया।',
    vaultMetadataSaved: 'दस्तावेज़ मेटाडेटा सहेजा गया (कोई फ़ाइल संलग्न नहीं)।',

    authTitle: 'SCHEMATRIX में साइन इन करें',
    authSubtitle: 'अपने सहेजे गए मूल्यांकन, दस्तावेज़ तिजोरी और व्यक्तिगत सेवाओं तक पहुँचें।',
    optional: 'वैकल्पिक',
    authMethodEmail: 'ईमेल',
    authMethodMobile: 'मोबाइल ओटीपी',
    authPhone: 'मोबाइल नंबर',
    authPhonePlaceholder: '10 अंकों का मोबाइल नंबर',
    authOtpLabel: 'ओटीपी दर्ज करें',
    authOtpPlaceholder: '6 अंकों का कोड',
    authSendCode: 'कोड भेजें',
    authVerify: 'सत्यापित करें और साइन इन करें',
    authOtpSent: 'सत्यापन कोड भेजा गया। जारी रखने के लिए 6 अंकों का कोड दर्ज करें।',
    authOtpResent: 'एक नया कोड भेजा गया है।',
    authChangePhone: 'नंबर बदलें',
    authResendCode: 'कोड पुनः भेजें',
    authResendIn: 'पुनः भेजें',
    authSecureBadge: 'हैश्ड क्रेडेंशियल और HTTP-only सत्रों द्वारा सुरक्षित।',
    authSupabaseBadge: 'सुरक्षित खाता (हैश्ड)',
    authSetupTitle: 'प्रमाणीकरण कॉन्फ़िगर नहीं है',
    authSetupMessage: 'Supabase प्रमाणीकरण अभी सेट नहीं है, इसलिए लाइव साइन-इन उपलब्ध नहीं है। वास्तविक खाते सक्षम करने के लिए Supabase कॉन्फ़िगर करें और अपनी परियोजना क्रेडेंशियल जोड़ें।',
    authSetupStep1: 'एक Supabase परियोजना बनाएँ और supabase/schema.sql चलाएँ।',
    authSetupStep2: 'NEXT_PUBLIC_SUPABASE_URL और NEXT_PUBLIC_SUPABASE_ANON_KEY जोड़ें।',
    authSetupStep3: 'साइन इन और साइन अप सक्षम करने के लिए ऐप पुनः प्रारंभ करें।',
    authFullName: 'पूरा नाम',
    authFullNamePlaceholder: 'आपका पूरा नाम',
    authEmail: 'ईमेल',
    authEmailPlaceholder: 'you@example.com',
    authPassword: 'पासवर्ड',
    authPasswordPlaceholder: 'कम से कम 6 अक्षर',
    authSuccess: 'सफलतापूर्वक साइन इन किया गया।',
    authDemoSuccess: 'स्थानीय डेमो सत्र में साइन इन किया गया (कोई सर्वर खाता नहीं बनाया गया)।',
    authFailed: 'प्रमाणीकरण विफल। कृपया अपनी जानकारी जांचें।',
    authSignedOut: 'आप साइन आउट हो गए हैं।',
    authDemoUserBadge: 'डेमो सत्र — यह वास्तविक सर्वर खाता नहीं है।',
    sahayakReplyLanguage: 'उत्तर की भाषा',
    sahayakReplyLanguageAuto: 'जैसी भाषा में मैं पूछूं',
    sahayakReplyLanguageAutoHint: 'उत्तर उसी भाषा में मिलेगा जिसमें आप लिखेंगे।',
    sahayakListening: 'सुन रहे हैं…',
    sahayakListeningHint: 'अब बोलिए। रोकने के लिए माइक्रोफ़ोन फिर दबाएँ।',
    sahayakStopListening: 'सुनना बंद करें',
    sahayakStartListening: 'अपना प्रश्न बोलिए',
    sahayakCancelListening: 'रद्द करें',
    sahayakMicDenied:
      'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग में माइक्रोफ़ोन की अनुमति दें और फिर कोशिश करें।',
    sahayakMicError: 'वाक् पहचान अप्रत्याशित रूप से बंद हो गई। कृपया फिर कोशिश करें।',
    sahayakNoSpeech: 'कोई वाक् नहीं सुना गया। कृपया फिर कोशिश करें।',
    sahayakSpeechUnsupported:
      'इस ब्राउज़र में वाक् इनपुट समर्थित नहीं है। कृपया नया Chrome, Edge या Safari इस्तेमाल करें, या अपना प्रश्न टाइप करें।',
    sahayakVoiceStart: 'वॉइस सहायक शुरू करें',
    sahayakVoiceActive: 'वॉइस सहायक सक्रिय है',
    sahayakVoiceEnd: 'वॉइस सहायक बंद करें',
    sahayakVoiceIdle: 'शुरू दबाएँ, फिर अपना प्रश्न बोलकर पूछें।',
    sahayakVoiceThinking: 'एआई सहायक सोच रहा है…',
    sahayakVoiceSpeaking: 'उत्तर बोला जा रहा है…',
    sahayakVoiceTranscript: 'आपने कहा',
    sahayakVoiceAnswer: 'एआई सहायक का उत्तर',
    sahayakPlay: 'पढ़कर सुनाएँ',
    sahayakPause: 'रोकें',
    sahayakResume: 'फिर शुरू करें',
    sahayakStop: 'बंद करें',
    sahayakSpeakUnsupported:
      'इस ब्राउज़र में वाक् प्लेबैक समर्थित नहीं है। लिखित उत्तर नीचे उपलब्ध है।',
    sahayakNoVoiceInstalled:
      'इस भाषा के लिए ब्राउज़र में कोई वाक् स्वर स्थापित नहीं है। लिखित उत्तर उपलब्ध है।',
  },
  te: {
    // Platform Branding
    appName: 'స్కీమాట్రిక్స్',
    appTagline: 'ఏఐ ఆధారిత భారత ప్రభుత్వ సంక్షేమ పథకాలు మరియు ప్రజా సేవల వేదిక',
    subtitle: 'ప్రజా హక్కులు మరియు ప్రభుత్వ సేవల కోసం ఏకీకృత డిజిటల్ పోర్టల్',
    govIndiaPortal: 'భారత ప్రభుత్వ డిజిటల్ సేవా చొరవ',
    welcomeBack: 'నమస్కారం',
    welcomeCitizen: 'పౌర పోర్టల్ కి స్వాగతం',

    // Navigation
    home: 'హోమ్',
    schemes: 'ప్రభుత్వ పథకాలు',
    services: 'ప్రజా సేవలు',
    checker: 'అర్హత తనిఖీ',
    vault: 'పత్రాల నిల్వ',
    tracker: 'దరఖాస్తుల స్థితి',
    offices: 'సమీప కార్యాలయాలు',
    sahayak: 'ఏఐ సహాయక్',
    notifications: 'నోటిఫికేషన్లు',
    profile: 'ప్రొఫైల్',
    admin: 'అడ్మిన్ కన్సోల్',

    // Authentication
    login: 'లాగిన్ చేయండి',
    register: 'ఖాతా సృష్టించండి',
    logout: 'లాగౌట్',
    demoCitizen: 'డెమో పౌరుడు (రైతు)',
    demoAdmin: 'డెమో ప్రభుత్వ అధికారి',

    // Accessibility Controls
    accessibility: 'సౌలభ్య సాధనాలు (Accessibility)',
    highContrast: 'హై కాంట్రాస్ట్ మోడ్',
    highContrastOn: 'హై కాంట్రాస్ట్ ఆన్',
    highContrastOff: 'హై కాంట్రాస్ట్ ఆఫ్',
    textSize: 'అక్షరాల పరిమాణం',
    normalText: 'సాధారణం (100%)',
    largeText: 'పెద్దది (115%)',
    xlargeText: 'చాలా పెద్దది (130%)',
    voiceAudio: 'వాయిస్ చదవడం',
    voiceAudioOn: 'వాయిస్ ఆడియో ఆన్',
    voiceAudioOff: 'వాయిస్ ఆడియో ఆఫ్',
    listenVoice: 'మీ భాషలో చదివి వినిపించండి',
    stopVoice: 'ఆపండి',
    skipToContent: 'ముఖ్యమైన సమాచారానికి వెళ్లండి',
    languageSelect: 'భాషను ఎంచుకోండి',

    // Search & Directory
    quickSearchPlaceholder: 'సంక్షేమ పథకాలు, సబ్సిడీలు, రేషన్ కార్డులు, భూమి రికార్డులు వెతకండి...',
    searchAction: 'వెతకండి',
    allCategories: 'అన్ని విభాగాలు',
    allStates: 'భారతదేశం మరియు అన్ని రాష్ట్రాలు',
    verifiedSource: 'ధృవీకరించబడిన అధికారిక మూలం',
    officialSource: 'అధికారిక మూలం',
    lastVerifiedOn: 'చివరిసారి ధృవీకరించిన తేదీ',
    locationActive: 'స్థానం యాక్టివ్',
    noOfficesAvailable: 'ఇంకా కార్యాలయాలు అందుబాటులో లేవు',
    noOfficesAvailableHint:
      'కార్యాలయాల డైరెక్టరీలో గుర్తించదగిన అధికారిక మూలం ఉన్న కార్యాలయాలు మాత్రమే ఉంటాయి. మీ ఫిల్టర్ల కోసం ఇంకా ధృవీకరించిన రికార్డులు ప్రచురించబడలేదు.',
    noOfficesFoundHint:
      'మరిన్ని ప్రభుత్వ కార్యాలయాలను కనుగొనడానికి శోధన పదాలు మార్చండి, కార్యాలయ రకం మార్చండి లేదా ఫిల్టర్లు తొలగించండి.',
    officesSeedBadge: 'నమూనా డైరెక్టరీ (ప్రత్యక్షం కాదు)',
    officesSeedBanner:
      'ఈ కార్యాలయాలు ప్రదర్శన కోసం జత చేసిన నమూనా రికార్డులు మాత్రమే, ప్రత్యక్ష ప్రభుత్వ ఫీడ్ కాదు. దూరాలు మరియు వివరాలు అంచనా వేయబడతాయి. ప్రత్యక్ష ఫలితాల కోసం Supabase ను ధృవీకరించిన కార్యాలయ డేటాతో కనెక్ట్ చేయండి.',
    needsReview: 'సమీక్షలో ఉంది',
    draft: 'చిత్తు ప్రతి',

    // Scheme & Service Card
    checkEligibility: 'అర్హతను తనిఖీ చేయండి',
    viewDetails: 'పూర్తి వివరాలు',
    applyNow: 'అధికారిక పోర్టల్',
    requiredDocs: 'కావలసిన పత్రాలు',
    benefits: 'పథకం ప్రయోజనాలు',
    department: 'శాఖ / మంత్రిత్వ శాఖ',
    category: 'వర్గం',
    helpline: 'హెల్ప్‌లైన్ నంబర్',
    deliveryTime: 'అంచనా వేసిన కాలపరిమితి',
    days: 'రోజులు',
    description: 'వివరణ',
    overview: 'అవలోకనం',

    // Deterministic Eligibility
    eligible: 'అర్హత ఉంది',
    notEligible: 'అర్హత నిబంధనలు సరిపోలలేదు',
    insufficientInfo: 'మరింత సమాచారం కావాలి',
    eligibilityNotice: 'ఫలితాలు అధికారిక ప్రభుత్వ మార్గదర్శకాల ఆధారంగా రూపొందించిన సమాచారం మాత్రమే.',

    // Categories
    catAgriculture: 'వ్యవసాయం మరియు రైతు సంక్షేమం',
    catHealth: 'వైద్యం మరియు ఆరోగ్యం',
    catHousing: 'గృహ నిర్మాణం',
    catEmployment: 'ఉపాధి మరియు శ్రామిక సంక్షేమం',
    catFood: 'ఆహార భద్రత మరియు రేషన్',
    catWomenChild: 'మహిళా మరియు శిశు సంక్షేమం',
    catCertificates: 'ధృవీకరణ పత్రాలు & భూ రికార్డులు',

    // Disclaimers & General
    statusDisclaimer: 'గమనిక: స్కీమాట్రిక్స్ కేవలం సమాచార మార్గదర్శకత్వాన్ని అందిస్తుంది. తుది ఆమోదం సంబంధిత ప్రభుత్వ శాఖల అధికార పరిధిలో ఉంటుంది.',
    demoModeActive: 'డెమో మోడ్: అధికారిక ప్రభుత్వ సమాచారంతో రన్ అవుతోంది.',
    loading: 'సమాచారం లోడ్ అవుతోంది...',
    saveChanges: 'ఎంపికలను భద్రపరచండి',
    close: 'మూసివేయి',
    back: 'వెనుకకు',
    next: 'తరువాత',

    // Discovery & Search
    clearSearch: 'వెతుకులాట క్లియర్ చేయండి',
    noSchemesFound: 'మీ శోధనకు లేదా ఫిల్టర్లకు సరిపోలే ప్రభుత్వ పథకాలు ఏవీ కనుగొనబడలేదు.',
    resetFilters: 'అన్ని ఫిల్టర్లను రీసెట్ చేయండి',
    nearbyGovtOffices: 'సమీప ప్రభుత్వ కార్యాలయాలు',
    nearbyGovtOfficesSubtitle: 'లైవ్ ఓపెన్‌స్ట్రీట్‌మ్యాప్ డేటాతో మీ చుట్టూ ఉన్న ప్రజా కార్యాలయాలను కనుగొనండి.',
    nearbyCached: 'క్యాష్ చేసిన ఫలితాలు',
    nearbyLive: 'లైవ్ ఫలితాలు',
    useMyLocation: 'నా స్థానాన్ని ఉపయోగించు',
    radiusLabel: 'వ్యాసార్థం',
    latitude: 'అక్షాంశం',
    longitude: 'రేఖాంశం',
    searchNearby: 'వెతకండి',
    nearbyHint: 'లొకేషన్ యాక్సెస్ ఇవ్వండి, లేదా నిర్దిష్ట స్థానం కోసం కోఆర్డినేట్లు నమోదు చేయండి.',
    nearbySearchPlaceholder: 'పేరు లేదా ప్రాంతం ద్వారా వెతకండి',
    filterByDistrict: 'జిల్లా ద్వారా ఫిల్టర్ చేయండి',
    nearbyAll: 'అన్నీ',
    nearbyGovernment: 'ప్రభుత్వం',
    nearbyMunicipal: 'మున్సిపాలిటీ',
    nearbyPanchayat: 'పంచాయతీ',
    nearbyRevenue: 'రెవెన్యూ / తాలూకా',
    nearbyCsc: 'సేవా కేంద్రం',
    nearbyPost: 'పోస్టాఫీసు',
    nearbyHealth: 'ఆసుపత్రి',
    nearbyPolice: 'పోలీసు',
    nearbyBusyHint: 'లైవ్ సేవ బిజీగా ఉంది; దయచేసి కొంతసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
    nearbyRetry: 'మళ్లీ ప్రయత్నించండి',
    nearbySearching: 'సమీప కార్యాలయాలను వెతుకుతోంది…',
    nearbyResults: 'చూపిస్తోంది',
    nearbyEmpty: 'సమీపంలో కార్యాలయాలు కనుగొనబడలేదు',
    nearbyEmptyHint: 'పెద్ద వ్యాసార్థాన్ని ప్రయత్నించండి, ఫిల్టర్లను మార్చండి లేదా వేరే స్థానాన్ని వెతకండి.',
    nearbyGetStarted: 'మీ సమీపంలో కార్యాలయాలను కనుగొనండి',
    nearbyGetStartedHint: 'మీ ప్రస్తుత స్థానాన్ని ఉపయోగించండి లేదా కోఆర్డినేట్లు నమోదు చేయండి, తర్వాత సమీప ప్రజా కార్యాలయాలను కనుగొనడానికి వ్యాసార్థాన్ని ఎంచుకోండి.',
    osmAttribution: 'కార్యాలయ డేటా © ఓపెన్‌స్ట్రీట్‌మ్యాప్ సహకారులు.',
    communityMapped: 'ఓపెన్‌స్ట్రీట్‌మ్యాప్ ఫలితాలు సముదాయం మ్యాప్ చేసినవి, ప్రభుత్వం ధృవీకరించినవి కావు.',
    communitySource: 'సముదాయ మూలం',
    fetchedOn: 'పొందిన తేదీ',
    locationUnavailable: 'ఈ పరికరంలో స్థానం అందుబాటులో లేదు.',
    locationDenied: 'స్థానం అనుమతి తిరస్కరించబడింది. దయచేసి మాన్యువల్గా కోఆర్డినేట్లు నమోదు చేయండి.',
    invalidCoords: 'చెల్లుబాటు అయ్యే అక్షాంశం (-90..90) మరియు రేఖాంశం (-180..180) నమోదు చేయండి.',
    nearbyError: 'లైవ్ కార్యాలయ డిస్కవరీ తాత్కాలికంగా అందుబాటులో లేదు. దయచేసి మళ్లీ ప్రయత్నించండి.',
    filterByState: 'రాష్ట్రాల వారీగా ఫిల్టర్',
    showingSchemes: 'పథకాలు చూపబడుతున్నాయి',
    eligibilityCriteria: 'వివరమైన అర్హత నిబంధనలు',
    intendedBeneficiaries: 'లబ్ధిదారుల వివరాలు',
    applicationMethod: 'దరఖాస్తు చేసుకునే విధానం',
    officialNotice: 'ధృవీకరించబడిన ప్రభుత్వ మార్గదర్శకాలు',
    sourceReferences: 'అధికారిక మూల సమాచారం',
    closeModal: 'వివరాలు మూసివేయి',
    allIndia: 'అఖిల భారత స్థాయి',
    filterCategory: 'వర్గాల వారీగా ఫిల్టర్',
    verifiedOnly: 'ధృవీకరించబడిన పథకాలు మాత్రమే',

    // Phase 4: Deterministic Eligibility Engine
    stepDemographics: '1. ప్రాథమిక వివరాలు & నివాసం',
    stepOccupation: '2. వృత్తి & సాగు భూమి వివరాలు',
    stepHousing: '3. ఇల్లు & కుటుంబ వసతులు',
    stepExclusions: '4. ప్రభుత్వ ఉద్యోగం/పన్ను & DBT',
    stepReview: '5. సమాధానాలను సమీక్షించండి',
    retakeAssessment: 'మళ్ళీ తనిఖీ చేయండి',
    assessmentResults: 'అర్హత మూల్యాంకన ఫలితాలు',
    criteriaSatisfied: 'సరిపోయిన అర్హత నిబంధనలు',
    criteriaNotSatisfied: 'సరిపోలని నిబంధనలు',
    missingInfoNotice: 'మరింత సమాచారం అవసరం',
    appearsEligibleCount: 'అర్హత ఉంది',
    criteriaNotMetCount: 'అర్హత నిబంధనలు సరిపోలలేదు',
    moreInfoCount: 'మరింత సమాచారం కావాలి',
    evaluateAllSchemes: 'అన్ని 6 జాతీయ పథకాల అర్హత తనిఖీ చేయండి',
    assessmentDisclaimer: 'గమనిక: ఈ అర్హత ఫలితాలు ప్రభుత్వ మార్గదర్శకాల ఆధారంగా రూపొందించిన సమాచారం మాత్రమే. అధికారిక ఆమోదం సంబంధిత ప్రభుత్వ శాఖల అధికార పరిధిలో ఉంటుంది.',
    selectOption: 'ఎంపిక చేసుకోండి',
    yesOption: 'అవును',
    noOption: 'కాదు',
    notSureOption: 'ఖచ్చితంగా తెలియదు / తనిఖీ చేయాలి',
    previousStep: 'మునుపటి దశ',
    nextStep: 'తరువాతి దశ',
    submitAssessment: 'అర్హతను మూల్యాంకనం చేయండి',

    // Phase 5: Public Services Directory & Offices Locator
    publicServicesDir: 'ప్రభుత్వ సేవల డైరెక్టరీ',
    officesLocator: 'మీ సమీపంలో ప్రభుత్వ కార్యాలయాలు',
    searchByServiceName: 'సేవ పేరు, పత్రాలు, విభాగం ద్వారా శోధన...',
    searchByOfficeName: 'కార్యాలయం, జిల్లా, మండల ద్వారా శోధన...',
    filterByOfficeType: 'కార్యాలయం రకానికి బట్టి ఫిల్టర్ చేయండి',
    allOfficeTypes: 'అన్ని రకాల కార్యాలయాలు',
    allServices: 'అన్ని సేవలు',
    getDirections: 'మార్గదేశాలు పొందండి',
    openInMaps: 'మ్యాప్‌లో తెరవండి',
    locationPermission: 'సమీప కార్యాలయాలను కనుగొనడానికి స్థానం యాక్సెస్ అనుమతించండి',
    enableLocation: 'నా స్థానాన్ని ఉపయోగించండి',
    manualLocation: 'మాన్యువల్ స్థానం ఎంచుకోండి',
    gpsUnavailable: 'స్థానం యాక్సెస్ నిరాకరించబడింది లేదా అందుబాటులో లేదు. మాన్యువల్ శోధన ఉపయోగిస్తోంది.',
    applicationFee: 'అవేదనం ఫీజు',
    processingTime: 'ప్రాసెసింగ్ సమయం',
    offlineLocation: 'వ్యక్తిగతంగా దరఖాస్తు చేసుకునే ప్రదేశం',
    viewAllServices: 'అన్ని సేవలను వీక్షించండి',
    relatedServices: 'సంబంధిత సేవలు',
    availableServicesAtOffice: 'ఇక్కడ సర్వీసెలు అందుబాటులో ఉన్నాయి',
    verifiedData: 'ధృవీకరించబడిన ప్రభుత్వ డేటా',
    unverifiedData: 'డైరెక్టరీ ప్రవేశం (అధృవీకరించబడినది)',
    noOfficesFound: 'మీ లొకేషన్ లేదా ఫిల్టర్స్తో సరిపోలే ఏ కార్యాలయాలు దొరకలేదు.',
    noServicesFound: 'మీ శోధనకు సరిపోలే ఏదైనా సేవ దొరకలేదు.',
    distanceKm: 'క.మీ దూరంలో',
    workingHours: 'పనీ సమయాలు',
    contactNumber: 'సంపక్ష సంఖ్య',
    officeType: 'కార్యాలయం రకం',
    selectState: 'రాష్ట్రాన్ని ఎంచుకోండి',
    selectDistrict: 'జಿಲ್ಲాను నమోదు చేయండి',
    locatingYou: 'మీ లొకేషన్ గుర్తించబడుతోంది...',
    officeLocatorDisclaimer: 'కార्यालय సమాచారం అధికారిక ప్రభుత్వ డైరెక్టరీల నుండి సేకరించబడింది. సందర్శించడానికి ముందు ఎల్లప్పుడూ సరిచేసుకోండి.',
    servicesDisclaimerNote: 'అన్ని సేవా సమాచారం అధికారిక ప్రభుత్వ మూలాలపై ఆధారపడింది. రుసుములు మరియు సమయక్రమాలు సూచనాత్మకమైనవి మరియు రాష్ట్రానికి మారవచ్చు.',
    freeService: 'ఉచితంగా',

    // Office Types
    officeTypeGramPanchayat: 'గ్రామ పంచాయతీ',
    officeTypeMandalOffice: 'తహశీల్దార్ / మండల రెవెన్యూ కార్యాలయం',
    officeTypeCSC: 'కామన్ సర్వీస్ సెంటర్ (CSC)',
    officeTypeAgriculture: 'వ్యవసాయ कार्यालय',
    officeTypeHealth: 'వైద్య కేంద్రాలు / ఆస్పత్రులు',
    officeTypePostOffice: 'డాక్ ఘర్లు',

    // Service Categories
    catEducation: 'విద్య & స్కాలర్‌షిప్‌లు',
    catLocalGovt: 'ప్రభుత్వం & పంచాయతీ',

    // Location & Distance
    sortByDistance: 'దూరం ప్రకారం అమర్చండి',

    // Phase 6: AI Sahayak, Document Vault, Authentication
    sahayakDemoBadge: 'ఆఫ్‌లైన్ డెమో సహాయక్',
    sahayakLiveAi: 'లైవ్ ఏఐ',
    sahayakBuiltIn: 'అంతర్నిర్మిత డేటాసెట్',
    sahayakPlaceholder: 'పథకాలు, అర్హత, పత్రాలు లేదా కార్యాలయాల గురించి అడగండి...',
    sahayakDisclaimer: 'లైవ్ ఏఐ కాన్ఫిగర్ చేయబడలేదు, కాబట్టి సమాధానాలు అంతర్నిర్మిత ధృవీకరించిన డేటాసెట్ నుండి వస్తాయి. లైవ్ ఏఐ ప్రారంభించడానికి GEMINI_API_KEY సెట్ చేయండి.',
    send: 'పంపండి',

    vaultAddDocument: 'పత్రం జోడించండి',
    vaultTitle: 'పత్రం శీర్షిక',
    vaultTitlePlaceholder: 'ఉదా. ఆధార్ కార్డు - రమేష్ కుమార్',
    vaultFile: 'ఫైల్ (ఐచ్ఛికం)',
    vaultFileHint: 'మెటాడేటా సర్వర్‌లో సేవ్ చేయబడుతుంది. ఆబ్జెక్ట్ స్టోర్ కాన్ఫిగర్ చేయకపోతే ఫైల్ బైట్లు నిల్వ చేయబడవు.',
    vaultNotes: 'గమనికలు',
    vaultNotesPlaceholder: 'ఈ పత్రం గురించి ఐచ్ఛిక గమనికలు',
    vaultSave: 'పత్రం సేవ్ చేయండి',
    vaultUploading: 'సేవ్ చేస్తోంది...',
    vaultMyDocuments: 'నా పత్రాలు',
    vaultItems: 'అంశాలు',
    vaultEmpty: 'ఇంకా పత్రాలు లేవు. ప్రారంభించడానికి మీ మొదటి పత్రాన్ని జోడించండి.',
    vaultDelete: 'పత్రం తొలగించండి',
    vaultDownload: 'పత్రాన్ని డౌన్‌లోడ్ చేయండి',
    vaultDownloadFailed: 'డౌన్‌లోడ్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    vaultSecureBadge: 'సురక్షిత రిమోట్ నిల్వ',
    vaultDemoBadge: 'మెటాడేటా నిల్వ',
    vaultDemoBanner: 'పత్ర మెటాడేటా సర్వర్‌లో సురక్షితంగా నిల్వ చేయబడుతుంది. ఫైల్ విషయాలకు ఆబ్జెక్ట్ స్టోర్ అవసరం మరియు ఇప్పుడు అప్‌లోడ్ చేయబడదు.',
    vaultSignInRequired: 'మీ పత్రాల నిల్వను ఉపయోగించడానికి దయచేసి సైన్ ఇన్ చేయండి.',
    vaultTitleRequired: 'పత్రం శీర్షిక అవసరం.',
    vaultUploadFailed: 'అప్‌లోడ్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    vaultDemoSaved: 'పత్ర మెటాడేటా సేవ్ చేయబడింది. ఫైల్ బైట్లు సర్వర్‌లో నిల్వ చేయబడలేదు (ఆబ్జెక్ట్ స్టోర్ కాన్ఫిగర్ చేయబడలేదు).',
    vaultRemoteSaved: 'పత్రం అప్‌లోడ్ చేయబడింది మరియు సురక్షితంగా సేవ్ చేయబడింది.',
    vaultMetadataSaved: 'పత్రం మెటాడేటా సేవ్ చేయబడింది (ఫైల్ జోడించబడలేదు).',

    authTitle: 'SCHEMATRIX కి సైన్ ఇన్ చేయండి',
    authSubtitle: 'మీ సేవ్ చేసిన అంచనాలు, పత్రాల నిల్వ మరియు వ్యక్తిగత సేవలను యాక్సెస్ చేయండి।',
    optional: 'ఐచ్ఛికం',
    authMethodEmail: 'ఈమెయిల్',
    authMethodMobile: 'మొబైల్ ఓటీపీ',
    authPhone: 'మొబైల్ నంబర్',
    authPhonePlaceholder: '10 అంకెల మొబైల్ నంబర్',
    authOtpLabel: 'ఓటీపీ నమోదు చేయండి',
    authOtpPlaceholder: '6 అంకెల కోడ్',
    authSendCode: 'కోడ్ పంపండి',
    authVerify: 'ధృవీకరించి సైన్ ఇన్ చేయండి',
    authOtpSent: 'ధృవీకరణ కోడ్ పంపబడింది. కొనసాగడానికి 6 అంకెల కోడ్ నమోదు చేయండి.',
    authOtpResent: 'కొత్త కోడ్ పంపబడింది.',
    authChangePhone: 'నంబర్ మార్చండి',
    authResendCode: 'కోడ్ మళ్లీ పంపండి',
    authResendIn: 'మళ్లీ పంపండి',
    authSecureBadge: 'హ్యాష్ చేసిన క్రెడెన్షియల్స్ మరియు HTTP-only సెషన్లతో సురక్షితం.',
    authSupabaseBadge: 'సురక్షిత ఖాతా (హ్యాష్ చేయబడింది)',
    authSetupTitle: 'ప్రామాణికత కాన్ఫిగర్ చేయబడలేదు',
    authSetupMessage: 'Supabase ప్రామాణికత ఇంకా సెట్ చేయబడలేదు, కాబట్టి లైవ్ సైన్-ఇన్ అందుబాటులో లేదు. నిజమైన ఖాతాలను ప్రారంభించడానికి Supabase కాన్ఫిగర్ చేయండి మరియు మీ ప్రాజెక్ట్ ఆధారాలను జోడించండి.',
    authSetupStep1: 'Supabase ప్రాజెక్ట్ సృష్టించండి మరియు supabase/schema.sql నడపండి.',
    authSetupStep2: 'NEXT_PUBLIC_SUPABASE_URL మరియు NEXT_PUBLIC_SUPABASE_ANON_KEY జోడించండి.',
    authSetupStep3: 'సైన్ ఇన్ మరియు సైన్ అప్ ప్రారంభించడానికి యాప్ ను పునఃప్రారంభించండి.',
    authFullName: 'పూర్తి పేరు',
    authFullNamePlaceholder: 'మీ పూర్తి పేరు',
    authEmail: 'ఈమెయిల్',
    authEmailPlaceholder: 'you@example.com',
    authPassword: 'పాస్‌వర్డ్',
    authPasswordPlaceholder: 'కనీసం 6 అక్షరాలు',
    authSuccess: 'విజయవంతంగా సైన్ ఇన్ చేయబడింది.',
    authDemoSuccess: 'స్థానిక డెమో సెషన్‌లో సైన్ ఇన్ చేయబడింది (సర్వర్ ఖాతా సృష్టించబడలేదు).',
    authFailed: 'ప్రామాణికత విఫలమైంది. దయచేసి మీ వివరాలు తనిఖీ చేయండి.',
    authSignedOut: 'మీరు సైన్ అవుట్ చేయబడ్డారు.',
    authDemoUserBadge: 'డెమో సెషన్ — ఇది నిజమైన సర్వర్ ఖాతా కాదు.',
    sahayakReplyLanguage: 'సమాధాన భాష',
    sahayakReplyLanguageAuto: 'నేను అడిగిన భాషలోనే',
    sahayakReplyLanguageAutoHint: 'మీరు ఏ భాషలో రాసినా సమాధానం అదే భాషలో వస్తుంది.',
    sahayakListening: 'వింటున్నాము…',
    sahayakListeningHint: 'ఇప్పుడు మాట్లాడండి. ఆపడానికి మైక్రోఫోన్‌ను మళ్లీ నొక్కండి.',
    sahayakStopListening: 'వినడం ఆపండి',
    sahayakStartListening: 'మీ ప్రశ్నను మాట్లాడండి',
    sahayakCancelListening: 'రద్దు చేయండి',
    sahayakMicDenied:
      'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్‌లలో మైక్రోఫోన్ అనుమతి ఇచ్చి మళ్లీ ప్రయత్నించండి.',
    sahayakMicError: 'వాక్ గుర్తింపు ఊహించని విధంగా ఆగిపోయింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    sahayakNoSpeech: 'ఏ వాక్ గుర్తించబడలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.',
    sahayakSpeechUnsupported:
      'ఈ బ్రౌజర్‌లో వాక్ ఇన్‌పుట్ మద్దతు లేదు. దయచేసి కొత్త Chrome, Edge లేదా Safari వాడండి, లేదా మీ ప్రశ్నను టైప్ చేయండి.',
    sahayakVoiceStart: 'వాయిస్ అసిస్టెంట్ ప్రారంభించండి',
    sahayakVoiceActive: 'వాయిస్ అసిస్టెంట్ యాక్టివ్‌గా ఉంది',
    sahayakVoiceEnd: 'వాయిస్ అసిస్టెంట్ ఆపండి',
    sahayakVoiceIdle: 'ప్రారంభించండి నొక్కి, తర్వాత మీ ప్రశ్నను బిగ్గరగా అడగండి.',
    sahayakVoiceThinking: 'ఏఐ సహాయక్ ఆలోచిస్తోంది…',
    sahayakVoiceSpeaking: 'సమాధానం చెప్పబడుతోంది…',
    sahayakVoiceTranscript: 'మీరు అడిగింది',
    sahayakVoiceAnswer: 'ఏఐ సహాయక్ సమాధానం',
    sahayakPlay: 'చదివి వినండి',
    sahayakPause: 'ఆపండి',
    sahayakResume: 'కొనసాగించండి',
    sahayakStop: 'ఆపివేయండి',
    sahayakSpeakUnsupported:
      'ఈ బ్రౌజర్‌లో వాక్ ప్లేబ్యాక్ మద్దతు లేదు. రాత సమాధానం క్రింద అందుబాటులో ఉంది.',
    sahayakNoVoiceInstalled:
      'ఈ భాషకు బ్రౌజర్‌లో ఏ వాక్ స్వరం ఇన్‌స్టాల్ చేయబడలేదు. రాత సమాధానం అందుబాటులో ఉంది.',
  }
};

export type TranslationKey = keyof typeof translations.en;

/**
 * Type-safe translation lookup with automatic fallback to English
 */
export function t(key: TranslationKey, lang: SupportedLanguage = 'en'): string {
  const dict = translations[lang] || translations.en;
  return (dict as Record<string, string>)[key] || translations.en[key] || String(key);
}

/**
 * Text-to-Speech (TTS) Voice Read-Aloud helper using Web Speech API
 */
export function speakText(text: string, lang: SupportedLanguage = 'en'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any running speech before starting new one
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const targetCode = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
  utterance.lang = targetCode;
  utterance.rate = 0.95; // Slightly slower for clarity in rural accessibility
  utterance.pitch = 1.0;

  // Try to find matching voice for target speech code
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang === targetCode || v.lang.startsWith(lang));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any active text-to-speech output
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/** BCP-47 recognition codes for browser SpeechRecognition, per supported language. */
export const SPEECH_RECOGNITION_LANG: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

/** Human-readable language name in its own script. */
export const LANGUAGE_NATIVE_NAME: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
};

/** Detect whether Gemini replied in a non-native script, so we can honor its actual language. */
export function scriptOf(text: string): SupportedLanguage {
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  return 'en';
}

/** Voice-selection score for a browser voice against a target language. */
export function scoreVoiceForLanguage(voice: SpeechSynthesisVoice, lang: SupportedLanguage): number {
  const code = (voice.lang || '').toLowerCase().replace('_', '-');
  const base = code.split('-')[0];
  const target = SPEECH_RECOGNITION_LANG[lang].toLowerCase();

  if (code === target) return 100;
  if (base === target.split('-')[0]) {
    // Same language, different region: good, but not ideal.
    return code.endsWith('-in') ? 80 : 60;
  }
  return 0;
}

/** Pick the best available voice for a language, or null when none is installed. */
export function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: SupportedLanguage
): SpeechSynthesisVoice | null {
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = 0;
  for (const v of voices) {
    const s = scoreVoiceForLanguage(v, lang);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return bestScore > 0 ? best : null;
}
