// ==============================================================================
// SCHEMATRIX - Core Data Models and Domain Types
// ==============================================================================

export type SupportedLanguage = 'en' | 'hi' | 'te';

export type UserRole = 'citizen' | 'admin';

export type SchemeReviewStatus = 'verified' | 'needs_review' | 'draft';

/** Where an office record came from. `official` = curated government source;
 *  `osm` = community-mapped OpenStreetMap data (not government-verified). */
export type OfficeSourceType = 'official' | 'osm';

export type ApplicationStatus =
  | 'Planning'
  | 'Documents Being Prepared'
  | 'Ready to Apply'
  | 'Submitted by User'
  | 'Under Follow-up'
  | 'Approved'
  | 'Rejected';

export type DocumentStatus = 'Uploaded' | 'Pending Review' | 'Reviewed' | 'Action Required';

export type EligibilityResult = 'appears_eligible' | 'criteria_not_met' | 'insufficient_information';

export interface Scheme {
  id: string;
  name: string;
  nameHi?: string;
  nameTe?: string;
  department: string;
  category: string;
  summary: string;
  summaryHi?: string;
  summaryTe?: string;
  intendedBeneficiaries: string;
  eligibilityCriteria: string[];
  benefits: string;
  benefitsHi?: string;
  benefitsTe?: string;
  requiredDocuments: string[];
  applicationMethod: string;
  officialUrl: string;
  applicableState?: string;
  contactHelpline?: string;
  reviewStatus: SchemeReviewStatus;
  rulesVersion?: string;
  lastReviewedAt: string;
  sourceReferences: string;
}

/** Scheme with the optional discovery fields attached. Records written before
 *  those fields existed still satisfy this type. */
export type SchemeWithDiscovery = Scheme & SchemeDiscoveryFields;

export interface PublicService {
  id: string;
  name: string;
  nameHi?: string;
  nameTe?: string;
  department: string;
  category: string;
  description: string;
  descriptionHi?: string;
  descriptionTe?: string;
  targetAudience: string;
  eligibilitySummary?: string;
  requiredDocuments: string[];
  steps: string[];
  officialUrl: string;
  offlineLocation?: string;
  applicationFee?: string;
  deliveryTimeDays: number;
  contactHelpline?: string;
  reviewStatus: SchemeReviewStatus;
  lastReviewedAt: string;
}

export interface PublicOffice {
  id: string;
  name: string;
  nameHi?: string;
  nameTe?: string;
  category: string;
  address: string;
  district: string;
  mandal?: string;
  village?: string;
  state: string;
  pinCode: string;
  phone: string;
  workingHours: string;
  availableServices?: string[];
  latitude?: number;
  longitude?: number;
  /** Human-readable name of the official directory this record was sourced from. */
  officialSource: string;
  /** Direct URL to the official source, so every record is independently traceable. */
  sourceUrl?: string;
  /** ISO date the record was last confirmed against the official source. */
  lastReviewedAt: string;
  distanceKm?: number;
  reviewStatus?: SchemeReviewStatus;
  /** Origin of the record. Absent on legacy records (treated as official). */
  sourceType?: OfficeSourceType;
  /** Stable external identifier (e.g. `osm:way/123`) for deduplication. */
  externalId?: string;
  /** Required attribution text (e.g. © OpenStreetMap contributors). */
  attribution?: string;
  /** ISO timestamp the live record was last fetched from the provider. */
  fetchedAt?: string;
  /** Website from the source, when present. */
  website?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  phoneVerified?: boolean;
  role: UserRole;
  state: string;
  district: string;
  village: string;
  pinCode: string;
  preferredLanguage: SupportedLanguage;
  accessibilityHighContrast: boolean;
  accessibilityLargeText: boolean;
  voiceAssistanceEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDocument {
  id: string;
  ownerId: string;
  title: string;
  category: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  status: DocumentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserApplication {
  id: string;
  ownerId: string;
  schemeOrServiceName: string;
  category: string;
  referenceNumber?: string;
  appliedDate?: string;
  userReportedStatus: ApplicationStatus;
  notes?: string;
  relatedDocumentIds?: string[];
  nextReminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityAssessment {
  id: string;
  userId?: string;
  schemeId: string;
  schemeName: string;
  schemeRuleVersion: string;
  answers: Record<string, any>;
  result: EligibilityResult;
  explanation: string;
  missingCriteria: string[];
  requiredDocuments: string[];
  officialUrl: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  type: 'system' | 'reminder' | 'scheme_update' | 'status_alert';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId?: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  createdAt: string;
}

// ==============================================================================
// Scheme discovery (scholarships + scheme directory)
// ==============================================================================

/** The ten discovery categories. Scholarships is a first-class value so the
 *  student finder can query it directly. */
export const SCHEME_CATEGORIES = [
  'Scholarships',
  'Education Assistance',
  'Farmer Schemes',
  'Women and Child Welfare',
  'Health Schemes',
  'Housing Schemes',
  'Employment and Skill Development',
  'Pension and Social Security',
  'Rural Development',
  'Financial Assistance',
  // Retained so records seeded by earlier versions of SCHEMATRIX keep resolving.
  'Agriculture',
  'Food Security',
  'Certificates',
] as const;

export type SchemeCategory = (typeof SCHEME_CATEGORIES)[number];

/** Education stages used by scholarship matching. */
export const EDUCATION_LEVELS = [
  'school',
  'pre-matric',
  'intermediate',
  'diploma',
  'undergraduate',
  'postgraduate',
  'technical',
  'any',
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

/** Application window state. `unconfirmed` is used whenever the official page
 *  published no date, so the UI never implies an open window that may have
 *  closed. Distinct from `ApplicationStatus`, which tracks a citizen's own
 *  application. */
export type SchemeWindowStatus = 'open' | 'closed' | 'upcoming' | 'unconfirmed';

/** How strongly a record was checked against an official source. */
export type SchemeVerificationStatus = 'verified' | 'partially_verified' | 'unverified';

/** Fields added to `Scheme` for directory search and eligibility matching. */
export interface SchemeDiscoveryFields {
  schemeKind?: 'welfare' | 'scholarship' | 'service';
  /** Category / community restriction, only where eligibility depends on it. */
  beneficiaryCategory?: string | null;
  educationLevel?: EducationLevel | null;
  eligibleCourses?: string[] | null;
  /** Annual family income ceiling in rupees, or null when the scheme sets none. */
  incomeLimitAnnual?: number | null;
  ageCriteria?: string | null;
  genderRequirement?: 'female' | 'male' | 'any' | null;
  district?: string | null;
  /** ISO date the application window opens, or null when not published. */
  applicationStartDate?: string | null;
  /** ISO date the application window closes, or null when not published. */
  applicationEndDate?: string | null;
  academicYear?: string | null;
  applicationStatus?: SchemeWindowStatus;
  /** Direct apply link, when it differs from the informational source page. */
  applyUrl?: string | null;
  /** Informational page the record was built from. */
  officialSourceUrl?: string | null;
  sourceOrganization?: string | null;
  /** ISO date the record was last checked against the source. */
  lastVerifiedAt?: string | null;
  verificationStatus?: SchemeVerificationStatus;
  /** Stable key used to de-duplicate across sources. */
  slug?: string | null;
}

/** A candidate match produced by the student scheme finder. */
export interface SchemeMatch {
  scheme: Scheme;
  /** Deterministic reasons this record surfaced, shown to the student. */
  reasons: string[];
  score: number;
}
