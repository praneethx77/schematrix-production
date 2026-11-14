// ==============================================================================
// SCHEMATRIX - MongoDB Collections, Document Shapes & Indexes
//
// Server-side helpers. Defines the canonical collection names, the stored
// document shapes (snake_case in the DB for stability), index creation, and
// idempotent seeding of scheme/service reference data.
// ==============================================================================

import { getDb } from './mongodb';
import { DEMO_SCHEMES, DEMO_SERVICES } from './demoData';
import { SEED_SCHEMES_WITH_HOUSEKEEPING } from './schemeSeed';

export const COLLECTIONS = {
  users: 'users',
  sessions: 'sessions',
  schemes: 'schemes',
  services: 'services',
  offices: 'offices',
  eligibilityAssessments: 'eligibility_assessments',
  documents: 'documents',
  applications: 'applications',
  notifications: 'notifications',
  auditLogs: 'audit_logs',
  otpCodes: 'otp_codes',
  officeCache: 'office_cache',
} as const;

export const SEED_SOURCE = 'demo_seed';
/** Marks the verified scholarship dataset, so it is never mistaken for a demo row. */
export const SCHOLARSHIP_SEED_SOURCE = 'official_seed';

// -----------------------------------------------------------------------------
// Index definitions
// -----------------------------------------------------------------------------
export async function ensureIndexes(): Promise<void> {
  const db = await getDb();

  // Drop stale session indexes from an earlier schema version that used
  // camelCase field names (userId/expiresAt/tokenHash instead of
  // user_id/expires_at/token_hash). Without this, index creation conflicts and
  // every session collides on a null tokenHash.
  try {
    const existing = await db.collection(COLLECTIONS.sessions).indexes();
    for (const idx of existing) {
      if (!idx.name || idx.name === '_id_') continue;
      const key = idx.key || {};
      const usesWrongField =
        'userId' in key || 'expiresAt' in key || 'tokenHash' in key;
      if (usesWrongField) {
        try {
          await db.collection(COLLECTIONS.sessions).dropIndex(idx.name);
        } catch {
          /* ignore individual drop failures */
        }
      }
    }
  } catch {
    /* ignore — collection may not exist yet */
  }

  // Remove orphaned sessions that were written with the wrong field shape.
  try {
    await db.collection(COLLECTIONS.sessions).deleteMany({
      $or: [{ tokenHash: { $exists: true } }, { token_hash: null }],
    });
  } catch {
    /* ignore */
  }

  await db.collection(COLLECTIONS.users).createIndexes([
    { key: { email: 1 }, unique: true, name: 'uniq_users_email' },
    {
      key: { phone: 1 },
      unique: true,
      name: 'uniq_users_phone',
      partialFilterExpression: { phone: { $type: 'string' } },
    },
  ]);

  await db.collection(COLLECTIONS.sessions).createIndexes([
    { key: { user_id: 1 }, name: 'idx_sessions_user' },
    { key: { expires_at: 1 }, name: 'idx_sessions_expires' },
    { key: { token_hash: 1 }, unique: true, name: 'uniq_sessions_token' },
  ]);

  await db.collection(COLLECTIONS.schemes).createIndexes([
    { key: { category: 1 }, name: 'idx_schemes_category' },
    { key: { review_status: 1 }, name: 'idx_schemes_status' },
    { key: { name: 1 }, name: 'idx_schemes_name' },
    { key: { name: 'text', summary: 'text', department: 'text' }, name: 'idx_schemes_text' },
    // Scholarship directory: unique stable key so a re-seed never duplicates,
    // plus indexes backing the filter combinations the finder offers.
    { key: { slug: 1 }, unique: true, sparse: true, name: 'uniq_schemes_slug' },
    { key: { scheme_kind: 1 }, name: 'idx_schemes_kind' },
    { key: { education_level: 1 }, name: 'idx_schemes_education_level' },
    { key: { academic_year: 1 }, name: 'idx_schemes_academic_year' },
    { key: { application_status: 1 }, name: 'idx_schemes_window_status' },
    { key: { applicable_state: 1 }, name: 'idx_schemes_state' },
    { key: { income_limit_annual: 1 }, name: 'idx_schemes_income_limit' },
  ]);

  await db.collection(COLLECTIONS.services).createIndexes([
    { key: { category: 1 }, name: 'idx_services_category' },
    { key: { review_status: 1 }, name: 'idx_services_status' },
    { key: { name: 1 }, name: 'idx_services_name' },
  ]);

  await db.collection(COLLECTIONS.offices).createIndexes([
    { key: { state: 1, district: 1, mandal: 1, village: 1 }, name: 'idx_offices_location' },
    { key: { category: 1 }, name: 'idx_offices_category' },
    { key: { name: 1 }, name: 'idx_offices_name' },
    { key: { latitude: 1, longitude: 1 }, name: 'idx_offices_geo' },
    { key: { location: '2dsphere' }, name: 'idx_offices_location_2dsphere' },
  ]);

  await db.collection(COLLECTIONS.officeCache).createIndexes([
    { key: { external_id: 1 }, unique: true, name: 'uniq_office_cache_external' },
    { key: { location: '2dsphere' }, name: 'idx_office_cache_2dsphere' },
    { key: { fetched_at: 1 }, name: 'idx_office_cache_fetched' },
    { key: { category: 1 }, name: 'idx_office_cache_category' },
  ]);

  await db.collection(COLLECTIONS.eligibilityAssessments).createIndexes([
    { key: { user_id: 1, created_at: -1 }, name: 'idx_assessments_user' },
    { key: { scheme_id: 1 }, name: 'idx_assessments_scheme' },
  ]);

  await db.collection(COLLECTIONS.documents).createIndexes([
    { key: { owner_id: 1, created_at: -1 }, name: 'idx_documents_owner' },
  ]);

  await db.collection(COLLECTIONS.applications).createIndexes([
    { key: { owner_id: 1, created_at: -1 }, name: 'idx_applications_owner' },
  ]);

  await db.collection(COLLECTIONS.notifications).createIndexes([
    { key: { recipient_user_id: 1, is_read: 1 }, name: 'idx_notifications_recipient' },
  ]);

  await db.collection(COLLECTIONS.auditLogs).createIndexes([
    { key: { created_at: -1 }, name: 'idx_audit_logs_created' },
  ]);

  await db.collection(COLLECTIONS.otpCodes).createIndexes([
    { key: { phone: 1 }, unique: true, name: 'uniq_otp_phone' },
    { key: { expires_at: 1 }, name: 'idx_otp_expires' },
  ]);
}

// -----------------------------------------------------------------------------
// Idempotent seeding of demonstration data
// -----------------------------------------------------------------------------

function isoOrNow(value?: string): string {
  return value || new Date().toISOString();
}

export interface SeedResult {
  schemes: number;
  services: number;
  offices: number;
}

/**
 * Seed scheme/service reference records. Idempotent: uses `bulkWrite` with
 * `updateOne ... upsert:true` keyed on the stable id, and only creates records
 * that do not already exist. Existing DB records are never overwritten when they
 * were curated by an operator (marked review_status 'verified' AND
 * source != demo_seed are left untouched).
 *
 * Offices are intentionally NOT seeded: the office directory only contains
 * records with a traceable official source URL, curated by an operator. Any
 * previously demo-seeded offices are purged here so fabricated records never
 * appear in the directory.
 */
export async function seedDemoData(): Promise<SeedResult> {
  const db = await getDb();

  const schemes = db.collection(COLLECTIONS.schemes);
  const services = db.collection(COLLECTIONS.services);
  const offices = db.collection(COLLECTIONS.offices);

  // Purge any offices that were seeded from bundled demo data in an earlier
  // version. These were fabricated records and must never be shown as real.
  try {
    await offices.deleteMany({ data_source: SEED_SOURCE });
  } catch {
    /* ignore — collection may not exist yet */
  }

  const schemeOps = DEMO_SCHEMES.map((s) => ({
    updateOne: {
      filter: { _id: s.id },
      update: {
        $setOnInsert: {
          name: s.name,
          name_hi: s.nameHi,
          name_te: s.nameTe,
          department: s.department,
          category: s.category,
          summary: s.summary,
          summary_hi: s.summaryHi,
          summary_te: s.summaryTe,
          intended_beneficiaries: s.intendedBeneficiaries,
          eligibility_criteria: s.eligibilityCriteria,
          benefits: s.benefits,
          benefits_hi: s.benefitsHi,
          benefits_te: s.benefitsTe,
          required_documents: s.requiredDocuments,
          application_method: s.applicationMethod,
          official_url: s.officialUrl,
          applicable_state: s.applicableState || 'All India',
          contact_helpline: s.contactHelpline,
          // Curated from published official government sources (see source_references).
          review_status: s.reviewStatus,
          rules_version: s.rulesVersion,
          last_reviewed_at: s.lastReviewedAt,
          source_references: s.sourceReferences,
          data_source: SEED_SOURCE,
          created_at: isoOrNow(),
        },
      },
      upsert: true,
    },
  }));

  const serviceOps = DEMO_SERVICES.map((s) => ({
    updateOne: {
      filter: { _id: s.id },
      update: {
        $setOnInsert: {
          name: s.name,
          name_hi: s.nameHi,
          name_te: s.nameTe,
          department: s.department,
          category: s.category,
          description: s.description,
          description_hi: s.descriptionHi,
          description_te: s.descriptionTe,
          target_audience: s.targetAudience,
          eligibility_summary: s.eligibilitySummary,
          required_documents: s.requiredDocuments,
          steps: s.steps,
          official_url: s.officialUrl,
          offline_location: s.offlineLocation,
          application_fee: s.applicationFee,
          delivery_time_days: s.deliveryTimeDays,
          contact_helpline: s.contactHelpline,
          review_status: 'needs_review',
          last_reviewed_at: s.lastReviewedAt,
          data_source: SEED_SOURCE,
          created_at: isoOrNow(),
        },
      },
      upsert: true,
    },
  }));

  const officeOps: any[] = [];

  if (schemeOps.length) await schemes.bulkWrite(schemeOps as any, { ordered: false });
  if (serviceOps.length) await services.bulkWrite(serviceOps as any, { ordered: false });
  if (officeOps.length) await offices.bulkWrite(officeOps as any, { ordered: false });

  return {
    schemes: schemeOps.length,
    services: serviceOps.length,
    offices: officeOps.length,
  };
}

/**
 * Write the verified scholarship dataset into the schemes collection.
 *
 * Idempotent and safe to re-run: records are keyed on their stable `slug` and
 * written with `updateOne ... upsert:true`. An existing record is only updated
 * when it came from this same seed source, so an operator's edits to a
 * scholarship record are never clobbered by a re-seed.
 */
export async function seedScholarships(): Promise<{ scholarships: number }> {
  const db = await getDb();
  const schemes = db.collection(COLLECTIONS.schemes);

  const ops = SEED_SCHEMES_WITH_HOUSEKEEPING.map((s) => ({
    updateOne: {
      filter: { slug: s.slug },
      update: {
        $setOnInsert: {
          id: s.id,
          slug: s.slug,
          name: s.name,
          name_hi: s.nameHi,
          name_te: s.nameTe,
          department: s.department,
          category: s.category,
          scheme_kind: s.schemeKind,
          summary: s.summary,
          summary_hi: s.summaryHi,
          summary_te: s.summaryTe,
          intended_beneficiaries: s.intendedBeneficiaries,
          eligibility_criteria: s.eligibilityCriteria,
          benefits: s.benefits,
          benefits_hi: s.benefitsHi,
          benefits_te: s.benefitsTe,
          required_documents: s.requiredDocuments,
          application_method: s.applicationMethod,
          official_url: s.officialUrl,
          applicable_state: s.applicableState || 'All India',
          contact_helpline: s.contactHelpline,
          review_status: s.reviewStatus,
          rules_version: s.rulesVersion,
          last_reviewed_at: s.lastReviewedAt,
          source_references: s.sourceReferences,
          beneficiary_category: s.beneficiaryCategory ?? null,
          education_level: s.educationLevel ?? null,
          eligible_courses: s.eligibleCourses ?? null,
          income_limit_annual: s.incomeLimitAnnual ?? null,
          age_criteria: s.ageCriteria ?? null,
          gender_requirement: s.genderRequirement ?? null,
          district: s.district ?? null,
          application_start_date: s.applicationStartDate ?? null,
          application_end_date: s.applicationEndDate ?? null,
          academic_year: s.academicYear ?? null,
          application_status: s.applicationStatus ?? 'unconfirmed',
          apply_url: s.applyUrl ?? null,
          official_source_url: s.officialSourceUrl ?? null,
          source_organization: s.sourceOrganization ?? null,
          last_verified_at: s.lastVerifiedAt ?? null,
          verification_status: s.verificationStatus ?? 'unverified',
          data_source: SCHOLARSHIP_SEED_SOURCE,
          created_at: isoOrNow(),
        },
      },
      upsert: true,
    },
  }));

  if (ops.length) await schemes.bulkWrite(ops as any, { ordered: false });
  return { scholarships: ops.length };
}

/**
 * Full idempotent initialization: create indexes + seed demonstration data.
 */
export async function initDatabase(): Promise<SeedResult> {
  await ensureIndexes();
  const result = await seedDemoData();
  const scholarshipResult = await seedScholarships();
  return { ...result, schemes: result.schemes + scholarshipResult.scholarships };
}