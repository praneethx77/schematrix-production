// ==============================================================================
// SCHEMATRIX - Server-side read queries for schemes/services/offices (MongoDB)
// Maps DB (snake_case) documents to the client domain types (camelCase).
// ==============================================================================

import 'server-only';
import { getDb, COLLECTIONS } from './mongodb';
import {
  Scheme,
  SchemeWithDiscovery,
  PublicService,
  PublicOffice,
  SchemeReviewStatus,
  EducationLevel,
  SchemeWindowStatus,
  SchemeVerificationStatus,
} from './types';
import { SEED_SCHEMES_WITH_HOUSEKEEPING } from './schemeSeed';

const iso = (v: unknown, fallback = new Date().toISOString()): string => {
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  return fallback;
};

/** Read a nullable string column without turning null into undefined. */
const nullableString = (v: unknown): string | null =>
  typeof v === 'string' && v.length > 0 ? v : null;

function mapScheme(row: any): SchemeWithDiscovery {
  return {
    id: row.id ?? String(row._id),
    name: row.name,
    nameHi: row.name_hi,
    nameTe: row.name_te,
    department: row.department,
    category: row.category,
    summary: row.summary,
    summaryHi: row.summary_hi,
    summaryTe: row.summary_te,
    intendedBeneficiaries: row.intended_beneficiaries,
    eligibilityCriteria: Array.isArray(row.eligibility_criteria)
      ? row.eligibility_criteria
      : [],
    benefits: row.benefits,
    benefitsHi: row.benefits_hi,
    benefitsTe: row.benefits_te,
    requiredDocuments: Array.isArray(row.required_documents)
      ? row.required_documents
      : [],
    applicationMethod: row.application_method,
    officialUrl: row.official_url,
    applicableState: row.applicable_state || 'All India',
    contactHelpline: row.contact_helpline,
    reviewStatus: (row.review_status as SchemeReviewStatus) || 'needs_review',
    rulesVersion: row.rules_version,
    lastReviewedAt: iso(row.last_reviewed_at),
    sourceReferences: row.source_references || '',

    // ---- Discovery fields -------------------------------------------------
    schemeKind: row.scheme_kind ?? undefined,
    beneficiaryCategory: nullableString(row.beneficiary_category),
    educationLevel: (row.education_level as EducationLevel | null) ?? null,
    eligibleCourses: Array.isArray(row.eligible_courses) ? row.eligible_courses : null,
    incomeLimitAnnual:
      typeof row.income_limit_annual === 'number' ? row.income_limit_annual : null,
    ageCriteria: nullableString(row.age_criteria),
    genderRequirement: row.gender_requirement ?? null,
    district: nullableString(row.district),
    applicationStartDate: nullableString(row.application_start_date),
    applicationEndDate: nullableString(row.application_end_date),
    academicYear: nullableString(row.academic_year),
    applicationStatus:
      (row.application_status as SchemeWindowStatus | undefined) ?? 'unconfirmed',
    applyUrl: nullableString(row.apply_url),
    officialSourceUrl: nullableString(row.official_source_url),
    sourceOrganization: nullableString(row.source_organization),
    lastVerifiedAt: nullableString(row.last_verified_at),
    verificationStatus:
      (row.verification_status as SchemeVerificationStatus | undefined) ?? 'unverified',
    slug: nullableString(row.slug),
  };
}

function mapService(row: any): PublicService {
  return {
    id: row.id ?? String(row._id),
    name: row.name,
    nameHi: row.name_hi,
    nameTe: row.name_te,
    department: row.department,
    category: row.category,
    description: row.description,
    descriptionHi: row.description_hi,
    descriptionTe: row.description_te,
    targetAudience: row.target_audience,
    eligibilitySummary: row.eligibility_summary,
    requiredDocuments: Array.isArray(row.required_documents)
      ? row.required_documents
      : [],
    steps: Array.isArray(row.steps) ? row.steps : [],
    officialUrl: row.official_url,
    offlineLocation: row.offline_location,
    applicationFee: row.application_fee,
    deliveryTimeDays: Number(row.delivery_time_days ?? 0),
    contactHelpline: row.contact_helpline,
    reviewStatus: (row.review_status as SchemeReviewStatus) || 'needs_review',
    lastReviewedAt: iso(row.last_reviewed_at),
  };
}

function mapOffice(row: any): PublicOffice {
  return {
    id: row.id ?? String(row._id),
    name: row.name,
    nameHi: row.name_hi,
    nameTe: row.name_te,
    category: row.category,
    address: row.address,
    district: row.district,
    mandal: row.mandal,
    village: row.village,
    state: row.state,
    pinCode: row.pin_code,
    phone: row.phone,
    workingHours: row.working_hours,
    availableServices: Array.isArray(row.available_services)
      ? row.available_services
      : undefined,
    latitude: row.latitude !== undefined ? Number(row.latitude) : undefined,
    longitude: row.longitude !== undefined ? Number(row.longitude) : undefined,
    officialSource: row.official_source,
    sourceUrl: row.source_url || undefined,
    lastReviewedAt: iso(row.last_reviewed_at),
    reviewStatus: (row.review_status as SchemeReviewStatus) || undefined,
  };
}

export async function getAllSchemes(): Promise<SchemeWithDiscovery[]> {
  const db = await getDb();
  const rows = await db
    .collection(COLLECTIONS.schemes)
    .find({})
    .sort({ name: 1 })
    .toArray();
  const mongoSchemes = rows.map(mapScheme);

  // Always include the verified seed dataset so scholarships and the student
  // finder are available even when MongoDB has not been seeded via the admin
  // endpoint. MongoDB records win on id collision; seed records never clobber
  // operator-curated data.
  const mongoIds = new Set(mongoSchemes.map((s) => s.id));
  const seedSchemes = SEED_SCHEMES_WITH_HOUSEKEEPING.filter((s) => !mongoIds.has(s.id));
  return [...mongoSchemes, ...seedSchemes];
}

export async function getSchemeById(id: string): Promise<SchemeWithDiscovery | null> {
  const db = await getDb();
  const row = await db
    .collection(COLLECTIONS.schemes)
    .findOne({ $or: [{ id }, { slug: id }, { _id: id }] } as any);
  return row ? mapScheme(row) : null;
}

export async function getAllServices(): Promise<PublicService[]> {
  const db = await getDb();
  const rows = await db
    .collection(COLLECTIONS.services)
    .find({})
    .sort({ name: 1 })
    .toArray();
  return rows.map(mapService);
}

export async function getAllOffices(): Promise<PublicOffice[]> {
  const db = await getDb();
  const rows = await db
    .collection(COLLECTIONS.offices)
    .find({})
    .sort({ name: 1 })
    .toArray();
  return rows.map(mapOffice);
}

export async function getOfficeById(id: string): Promise<PublicOffice | null> {
  const db = await getDb();
  const row = await db
    .collection(COLLECTIONS.offices)
    .findOne({ $or: [{ id }, { _id: id }] } as any);
  return row ? mapOffice(row) : null;
}

export { mapScheme, mapService, mapOffice };