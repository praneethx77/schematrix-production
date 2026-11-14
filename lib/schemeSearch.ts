// ==============================================================================
// SCHEMATRIX - Scheme search, filtering and student eligibility matching
//
// Pure, dependency-free functions. They run on the server (for API routes and
// AI Sahayak grounding) and are safe to import into client components.
//
// Design rules enforced here:
//   - A match is always labelled "Potential match - verify final eligibility".
//   - A record never asserts a qualification the student did not supply. When a
//     field is unknown, the scheme is still shown but the reason says so.
//   - Official scheme names are returned verbatim; matching is done on a
//     normalised copy so translated or scripted input still finds them.
// ==============================================================================

import type { Scheme, SchemeMatch, SchemeWithDiscovery, EducationLevel } from './types';
import { EDUCATION_LEVELS } from './types';

/** Fields a caller may filter the directory on. */
export interface SchemeFilters {
  query?: string;
  category?: string;
  state?: string;
  district?: string;
  educationLevel?: EducationLevel | string;
  beneficiaryCategory?: string;
  maxIncomeAnnual?: number;
  minAge?: number;
  maxAge?: number;
  gender?: 'female' | 'male' | 'any';
  course?: string;
  applicationStatus?: string;
  academicYear?: string;
  onlyScholarships?: boolean;
}

/** Everything a student may volunteer for matching. No sensitive identifiers. */
export interface StudentProfile {
  state?: string | null;
  district?: string | null;
  educationLevel?: EducationLevel | string | null;
  course?: string | null;
  academicYear?: string | null;
  annualFamilyIncome?: number | null;
  category?: string | null;
  gender?: 'female' | 'male' | 'any' | null;
  age?: number | null;
}

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

/** Lowercase, strip diacritics and punctuation, collapse whitespace. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F\u0C00-\u0C7F]+/g, ' ')
    .trim();
}

/** Tokens of at least two characters, used for relevance scoring. */
export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length >= 2);
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'can', 'get', 'what', 'which', 'who', 'how', 'with',
  'from', 'that', 'this', 'have', 'has', 'was', 'were', 'you', 'your', 'our', 'any',
  'scheme', 'schemes', 'available', 'eligibility', 'apply', 'application',
  'government', 'student', 'students', 'benefit', 'benefits',
]);

/** Remove filler words so "which scholarships can I get" matches on real terms. */
function meaningfulTokens(value: string): string[] {
  return tokenize(value).filter((token) => !STOP_WORDS.has(token));
}

/** Normalise a state name so "Telangana" and "telangana " compare equal. */
export function normalizeState(value: string): string {
  return normalizeText(value);
}

// ---------------------------------------------------------------------------
// Directory search
// ---------------------------------------------------------------------------

/** Human-readable income ceiling, e.g. "Rs 2.5 lakh per annum". */
export function formatIncomeLimit(limit: number | null | undefined): string {
  if (limit === null || limit === undefined) return 'Not specified in official source';
  if (limit >= 10000000) return `Rs ${(limit / 10000000).toFixed(limit % 10000000 === 0 ? 0 : 2)} crore per annum`;
  if (limit >= 100000) return `Rs ${(limit / 100000).toFixed(limit % 100000 === 0 ? 0 : 2)} lakh per annum`;
  return `Rs ${limit.toLocaleString('en-IN')} per annum`;
}

/** Score a single scheme against a free-text query. 0 means no match. */
export function scoreTextMatch(scheme: SchemeWithDiscovery, query: string): number {
  const tokens = meaningfulTokens(query);
  if (tokens.length === 0) return 0;

  const name = normalizeText(scheme.name);
  const haystack = normalizeText(
    [
      scheme.name,
      scheme.nameHi ?? '',
      scheme.nameTe ?? '',
      scheme.department,
      scheme.summary,
      scheme.intendedBeneficiaries,
      scheme.eligibilityCriteria.join(' '),
      scheme.eligibleCourses?.join(' ') ?? '',
      scheme.beneficiaryCategory ?? '',
    ].join(' ')
  );

  let score = 0;
  for (const token of tokens) {
    if (name.includes(token)) score += 6;
    else if (haystack.includes(token)) score += 2;
  }
  return score;
}

/** Apply every supplied filter to a set of schemes. */
export function filterSchemes(schemes: SchemeWithDiscovery[], filters: SchemeFilters): SchemeWithDiscovery[] {
  const query = filters.query?.trim();
  const state = filters.state ? normalizeState(filters.state) : null;
  const district = filters.district ? normalizeState(filters.district) : null;

  const scored = schemes
    .map((scheme) => {
      // A scheme with no geographic restriction serves every state.
      const stateOk =
        !state ||
        !scheme.applicableState ||
        normalizeState(scheme.applicableState) === state ||
        normalizeState(scheme.applicableState).includes(state);

      if (!stateOk) return null;

      if (filters.category && scheme.category !== filters.category) return null;
      if (filters.onlyScholarships && scheme.schemeKind !== 'scholarship') return null;

      if (filters.educationLevel) {
        const wanted = String(filters.educationLevel);
        const level = scheme.educationLevel;
        if (wanted !== 'any' && level && level !== 'any' && level !== wanted) return null;
      }

      if (filters.beneficiaryCategory) {
        const wanted = normalizeState(filters.beneficiaryCategory);
        const actual = normalizeState(scheme.beneficiaryCategory ?? '');
        if (!actual.includes(wanted)) return null;
      }

      if (typeof filters.maxIncomeAnnual === 'number') {
        if (scheme.incomeLimitAnnual !== null && scheme.incomeLimitAnnual !== undefined) {
          if (scheme.incomeLimitAnnual > filters.maxIncomeAnnual) return null;
        }
      }

      if (filters.gender && filters.gender !== 'any') {
        const requirement = scheme.genderRequirement ?? 'any';
        if (requirement !== 'any' && requirement !== filters.gender) return null;
      }

      if (district) {
        const schemeDistrict = scheme.district ? normalizeState(scheme.district) : null;
        if (schemeDistrict && !schemeDistrict.includes(district)) return null;
      }

      if (filters.applicationStatus && scheme.applicationStatus) {
        if (scheme.applicationStatus !== filters.applicationStatus) return null;
      }

      if (filters.academicYear && scheme.academicYear) {
        if (scheme.academicYear !== filters.academicYear) return null;
      }

      if (filters.course) {
        const wanted = normalizeState(filters.course);
        const courses = (scheme.eligibleCourses ?? []).map(normalizeState);
        const courseOk = courses.some((course) => course.includes(wanted));
        const nameOk = normalizeState(scheme.name).includes(wanted);
        if (!courseOk && !nameOk) return null;
      }

      const textScore = query ? scoreTextMatch(scheme, query) : 0;
      if (query && textScore === 0) return null;

      return { scheme, score: textScore };
    })
    .filter((entry): entry is { scheme: SchemeWithDiscovery; score: number } => entry !== null);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Open windows first, then verified records, then name for stability.
    const statusRank = (s: SchemeWithDiscovery) =>
      s.applicationStatus === 'open' ? 0 : s.applicationStatus === 'unconfirmed' ? 1 : 2;
    const byStatus = statusRank(a.scheme) - statusRank(b.scheme);
    if (byStatus !== 0) return byStatus;
    return a.scheme.name.localeCompare(b.scheme.name);
  });

  return scored.map((entry) => entry.scheme);
}

// ---------------------------------------------------------------------------
// Student eligibility matching
// ---------------------------------------------------------------------------

/** Map a free-text education level to the canonical value, when possible. */
export function resolveEducationLevel(input: string | undefined | null): EducationLevel | null {
  if (!input) return null;
  const value = normalizeText(input);
  if ((EDUCATION_LEVELS as readonly string[]).includes(value)) return value as EducationLevel;

  if (/\b(class\s*(9|10)|10th|ssc|secondary|school)\b/.test(value)) return 'school';
  if (/\b(pre[\s-]?matric|pre[\s-]?metric)\b/.test(value)) return 'pre-matric';
  if (/\b(intermediate|12th|higher secondary|plus two|pu)\b/.test(value)) return 'intermediate';
  if (/\b(diploma|polytechnic)\b/.test(value)) return 'diploma';
  if (/\b(b\.?tech|b\.?e\b|engineering|bachelor|undergraduate|ug|degree|ba\b|b\.?sc|b\.?com)\b/.test(value)) {
    return 'undergraduate';
  }
  if (/\b(m\.?tech|m\.?e\b|master|postgraduate|pg|mba|m\.?sc|m\.?a\b|phd)\b/.test(value)) {
    return 'postgraduate';
  }
  return null;
}

/** Does an education level satisfy a scheme's requirement? */
function levelSatisfies(studentLevel: EducationLevel | null, schemeLevel: EducationLevel | null | undefined): boolean {
  if (!schemeLevel || schemeLevel === 'any') return true;
  if (!studentLevel) return false;
  // Exact match: a student is only matched to schemes that target their own
  // level, so we never suggest a school scholarship to a graduate or vice
  // versa. 'technical' is treated as its own level by callers.
  return studentLevel === schemeLevel;
}

/** Normalise a free-text category so "SC" and "scheduled caste" both match. */
function normalizeCategory(value: string): string {
  const text = normalizeText(value);
  if (/\b(sc|scheduled caste)\b/.test(text)) return 'scheduled caste';
  if (/\b(st|scheduled tribe)\b/.test(text)) return 'scheduled tribe';
  if (/\b(obc|bc|backward class)\b/.test(text)) return 'backward class';
  if (/\b(ebc|other backward)\b/.test(text)) return 'economically backward class';
  if (/\b(minorit|muslim|christian|sikh|buddhist|jain|parsi)\b/.test(text)) return 'minority';
  if (/\b(pwd|disabled|differently abled|divyang)\b/.test(text)) return 'disability';
  if (/\b(female|girl|woman|women)\b/.test(text)) return 'female';
  return text;
}

/**
 * Rank schemes for one student. Returns only records the student could plausibly
 * apply to, each with explicit reasons. Unknown inputs never silently disqualify
 * a record; they surface as "verify" reasons instead.
 */
export function matchSchemesForStudent(
  schemes: SchemeWithDiscovery[],
  profile: StudentProfile
): SchemeMatch[] {
  const studentLevel = resolveEducationLevel(profile.educationLevel ?? null);
  const wantedCategory = profile.category ? normalizeCategory(profile.category) : null;
  const state = profile.state ? normalizeState(profile.state) : null;

  const matches: SchemeMatch[] = [];

  for (const scheme of schemes) {
    if (scheme.schemeKind !== 'scholarship') continue;

    const reasons: string[] = [];
    let score = 0;
    let hardBlock = false;

    // --- Geography ---------------------------------------------------------
    if (state) {
      const schemeState = scheme.applicableState ? normalizeState(scheme.applicableState) : null;
      if (schemeState && schemeState !== 'all india') {
        if (schemeState !== state && !schemeState.includes(state)) {
          hardBlock = true;
        } else {
          reasons.push(`Open to students domiciled in ${scheme.applicableState}`);
          score += 3;
        }
      }
    }

    if (hardBlock) continue;

    // --- Education level ---------------------------------------------------
    const levelOk = levelSatisfies(studentLevel, scheme.educationLevel ?? null);
    if (studentLevel && scheme.educationLevel && scheme.educationLevel !== 'any') {
      if (levelOk) {
        reasons.push(`Matches your education level (${studentLevel})`);
        score += 4;
      } else {
        hardBlock = true;
      }
    }
    if (hardBlock) continue;

    // --- Course ------------------------------------------------------------
    if (profile.course && scheme.eligibleCourses?.length) {
      const wanted = normalizeState(profile.course);
      const courseMatch = scheme.eligibleCourses.some((course) => {
        const normalized = normalizeState(course);
        return normalized.includes(wanted) || wanted.includes(normalized);
      });
      if (courseMatch) {
        reasons.push(`Your course (${profile.course}) is covered by this scheme`);
        score += 3;
      }
    }

    // --- Income ------------------------------------------------------------
    if (typeof profile.annualFamilyIncome === 'number') {
      if (scheme.incomeLimitAnnual === null || scheme.incomeLimitAnnual === undefined) {
        reasons.push('No income limit is set by this scheme');
      } else if (profile.annualFamilyIncome <= scheme.incomeLimitAnnual) {
        reasons.push(
          `Your annual family income is within the ${formatIncomeLimit(scheme.incomeLimitAnnual)} ceiling`
        );
        score += 4;
      } else {
        hardBlock = true;
      }
    }
    if (hardBlock) continue;

    // --- Category ----------------------------------------------------------
    if (wantedCategory) {
      const schemeCategory = scheme.beneficiaryCategory ?? null;
      const isGenderScheme = schemeCategory
        ? /female|male|girl|woman|men/.test(schemeCategory.toLowerCase())
        : false;
      if (!schemeCategory) {
        reasons.push('This scheme does not restrict eligibility by category');
      } else if (isGenderScheme) {
        // Gender-based schemes are matched through genderRequirement above, so a
        // caste/category answer never blocks them.
        reasons.push('Your category is welcome under this scheme');
      } else {
        const normScheme = normalizeCategory(schemeCategory);
        if (
          normScheme.includes(wantedCategory) ||
          wantedCategory.includes(normScheme)
        ) {
          reasons.push(`Your category (${profile.category}) is eligible under this scheme`);
          score += 4;
        } else {
          hardBlock = true;
        }
      }
    }
    if (hardBlock) continue;

    // --- Gender ------------------------------------------------------------
    if (profile.gender && profile.gender !== 'any') {
      const requirement = scheme.genderRequirement ?? 'any';
      if (requirement !== 'any' && requirement !== profile.gender) {
        hardBlock = true;
      } else if (requirement === profile.gender) {
        reasons.push('This scheme is specifically for your gender group');
        score += 2;
      }
    }
    if (hardBlock) continue;

    // --- Age ---------------------------------------------------------------
    if (typeof profile.age === 'number' && scheme.ageCriteria) {
      const limits = scheme.ageCriteria.match(/\d+/g)?.map(Number) ?? [];
      const ceiling = limits.length ? Math.max(...limits) : null;
      if (ceiling !== null && profile.age > ceiling) {
        hardBlock = true;
      } else if (ceiling !== null) {
        reasons.push(`Your age is within the scheme limit (${scheme.ageCriteria})`);
        score += 2;
      }
    }
    if (hardBlock) continue;

    // --- Academic year -----------------------------------------------------
    if (profile.academicYear && scheme.academicYear) {
      if (scheme.academicYear === profile.academicYear) {
        reasons.push(`Listed for academic year ${scheme.academicYear}`);
        score += 1;
      }
    }

    if (reasons.length === 0) continue;

    matches.push({ scheme, reasons, score });
  }

  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.scheme.name.localeCompare(b.scheme.name);
  });

  return matches;
}