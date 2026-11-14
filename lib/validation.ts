// ==============================================================================
// SCHEMATRIX - Zod request validation schemas
// Used by server API routes to validate and normalize untrusted input.
// ==============================================================================

import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(3, 'Email is required.')
  .max(254, 'Email is too long.')
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters.')
  .max(128, 'Password is too long.');

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Enter your full name.')
  .max(120, 'Name is too long.');

export const registerSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  preferredLanguage: z.enum(['en', 'hi', 'te']).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.').max(128),
});

export const documentMetaSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  category: z.string().trim().min(1).max(120),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().max(120).default('application/octet-stream'),
  fileSize: z.number().int().nonnegative().max(10 * 1024 * 1024),
  notes: z.string().trim().max(1000).optional(),
});

export const assessmentSchema = z.object({
  schemeId: z.string().trim().min(1),
  schemeName: z.string().trim().min(1),
  schemeRuleVersion: z.string().trim().default('2024.1'),
  answers: z.record(z.string(), z.unknown()),
  result: z.enum([
    'appears_eligible',
    'criteria_not_met',
    'insufficient_information',
  ]),
  explanation: z.string().trim().min(1),
  missingCriteria: z.array(z.string()).default([]),
  requiredDocuments: z.array(z.string()).default([]),
  officialUrl: z.string().trim().default(''),
});

// -----------------------------------------------------------------------------
// Mobile OTP authentication
// -----------------------------------------------------------------------------
/** Indian mobile: 10 digits, starting 6-9 (accepts +91 / 0 prefixes). */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, '').slice(-10))
  .refine((v) => /^[6-9]\d{9}$/.test(v), 'Enter a valid 10-digit Indian mobile number.');

export const otpRequestSchema = z.object({
  phone: phoneSchema,
  fullName: fullNameSchema.optional(),
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit OTP.'),
});