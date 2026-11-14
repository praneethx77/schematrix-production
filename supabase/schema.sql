-- ==============================================================================
-- SCHEMATRIX - Supabase PostgreSQL Database Schema & Migration
-- AI-Powered Indian Government Welfare Schemes Discovery & Citizen Services
-- ==============================================================================

-- 0. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. USERS PROFILE TABLE (Extends Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  state TEXT DEFAULT 'Telangana',
  district TEXT DEFAULT 'Warangal',
  village TEXT DEFAULT 'Rampoor',
  pin_code TEXT DEFAULT '506001',
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'te')),
  accessibility_high_contrast BOOLEAN DEFAULT FALSE,
  accessibility_large_text BOOLEAN DEFAULT FALSE,
  voice_assistance_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 2. GOVERNMENT SCHEMES DIRECTORY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.schemes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_hi TEXT,
  name_te TEXT,
  department TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  summary_hi TEXT,
  summary_te TEXT,
  intended_beneficiaries TEXT NOT NULL,
  eligibility_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  benefits TEXT NOT NULL,
  benefits_hi TEXT,
  benefits_te TEXT,
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  application_method TEXT NOT NULL,
  official_url TEXT NOT NULL,
  applicable_state TEXT DEFAULT 'All India',
  contact_helpline TEXT,
  review_status TEXT DEFAULT 'verified' CHECK (review_status IN ('verified', 'needs_review', 'draft')),
  source_references TEXT NOT NULL,
  rules_version TEXT DEFAULT '2024.1',
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 3. PUBLIC STATUTORY SERVICES DIRECTORY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_hi TEXT,
  name_te TEXT,
  department TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  official_url TEXT NOT NULL,
  delivery_time_days INTEGER DEFAULT 15,
  contact_helpline TEXT,
  review_status TEXT DEFAULT 'verified' CHECK (review_status IN ('verified', 'needs_review', 'draft')),
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 4. NEARBY PUBLIC OFFICES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.offices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_hi TEXT,
  name_te TEXT,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  mandal TEXT,
  village TEXT,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  working_hours TEXT NOT NULL,
  available_services JSONB DEFAULT '[]'::jsonb,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  official_source TEXT NOT NULL,
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Idempotent column additions for offices created by an earlier schema version.
ALTER TABLE public.offices ADD COLUMN IF NOT EXISTS mandal TEXT;
ALTER TABLE public.offices ADD COLUMN IF NOT EXISTS village TEXT;
ALTER TABLE public.offices ADD COLUMN IF NOT EXISTS available_services JSONB DEFAULT '[]'::jsonb;

-- ==============================================================================
-- 5. DETERMINISTIC ELIGIBILITY ASSESSMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.eligibility_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id TEXT REFERENCES public.schemes(id) ON DELETE CASCADE,
  scheme_name TEXT NOT NULL,
  scheme_rule_version TEXT NOT NULL DEFAULT '2024.1',
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  result TEXT NOT NULL CHECK (result IN ('appears_eligible', 'criteria_not_met', 'insufficient_information')),
  explanation TEXT NOT NULL,
  missing_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  official_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 6. PRIVATE CITIZEN DOCUMENT VAULT TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT DEFAULT 'Uploaded' CHECK (status IN ('Uploaded', 'Pending Review', 'Reviewed', 'Action Required')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 7. CITIZEN APPLICATION TRACKING JOURNAL TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_or_service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  reference_number TEXT,
  applied_date DATE,
  user_reported_status TEXT NOT NULL DEFAULT 'Planning' 
    CHECK (user_reported_status IN ('Planning', 'Documents Being Prepared', 'Ready to Apply', 'Submitted by User', 'Under Follow-up', 'Approved', 'Rejected')),
  notes TEXT,
  related_document_ids JSONB DEFAULT '[]'::jsonb,
  next_reminder_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 8. CITIZEN NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('system', 'reminder', 'scheme_update', 'status_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 9. CITIZEN REMINDERS & CALENDAR FOLLOW-UPS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 10. AI SAHAYAK CHAT HISTORY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi', 'te')),
  source_references JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 11. IMMUTABLE ADMINISTRATIVE SECURITY AUDIT LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 12. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON public.schemes(review_status);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_offices_district ON public.offices(district);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON public.documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_applications_owner ON public.applications(owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_reminders_owner ON public.reminders(owner_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON public.eligibility_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_owner ON public.chat_messages(owner_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 13. AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public Directory Policies (Schemes, Services, Offices are readable by everyone)
CREATE POLICY "Anyone can view verified schemes"
  ON public.schemes FOR SELECT
  USING (review_status = 'verified' OR public.is_admin());

CREATE POLICY "Admins can manage schemes"
  ON public.schemes FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view verified services"
  ON public.services FOR SELECT
  USING (review_status = 'verified' OR public.is_admin());

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view offices"
  ON public.offices FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage offices"
  ON public.offices FOR ALL
  USING (public.is_admin());

-- Private Citizen Vault Policies (Strict User Ownership)
CREATE POLICY "Citizens can manage their own documents"
  ON public.documents FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Citizens can manage their own applications"
  ON public.applications FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Citizens can manage their own reminders"
  ON public.reminders FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Citizens can manage their own assessments"
  ON public.eligibility_assessments FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Citizens can manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = recipient_user_id)
  WITH CHECK (auth.uid() = recipient_user_id);

CREATE POLICY "Citizens can manage their chat messages"
  ON public.chat_messages FOR ALL
  USING (auth.uid() = owner_id OR owner_id IS NULL)
  WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

-- Audit Log Policies
CREATE POLICY "Authenticated users can record audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- ==============================================================================
-- 15. SEED CURATED GOVERNMENT SCHEMES DATA
-- ==============================================================================
INSERT INTO public.schemes (id, name, name_hi, name_te, department, category, summary, intended_beneficiaries, eligibility_criteria, benefits, required_documents, application_method, official_url, applicable_state, contact_helpline, review_status, source_references)
VALUES
(
  'pm-kisan',
  'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
  'प्रधानमंत्री किसान सम्मान निधि',
  'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి',
  'Ministry of Agriculture and Farmers Welfare',
  'Agriculture',
  'Income support of ₹6,000 per year in three equal 4-monthly installments of ₹2,000 directly into bank accounts of all landholding farmer families.',
  'Small and marginal landholder farmer families with cultivable land.',
  '["Must possess cultivable landholding in family name according to official land records", "Not an institutional landholder", "Not a serving/retired government official (Group A, B, C)", "Did not pay income tax in the previous assessment year", "Active Aadhaar-seeded bank account (DBT enabled)"]'::jsonb,
  '₹6,000 direct income assistance per year transferred via Direct Benefit Transfer (DBT) in 3 equal installments of ₹2,000 each.',
  '["Aadhaar Card", "Updated Land Records (Patta / RoR / Pahani / 1-B)", "Active Bank Passbook (DBT seeded)", "Aadhaar-linked Mobile Number"]'::jsonb,
  'Online via pmkisan.gov.in portal or assisted submission at nearest Common Service Center (CSC).',
  'https://pmkisan.gov.in',
  'All India',
  '155261 / 011-24300606',
  'verified',
  'Official PM-KISAN Operational Guidelines, Ministry of Agriculture & Farmers Welfare, GoI'
),
(
  'ayushman-bharat',
  'Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)',
  'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
  'ఆయుష్మాన్ భారత్ - ప్రధాన మంత్రి జన్ ఆరోగ్య యోజన',
  'National Health Authority, Ministry of Health and Family Welfare',
  'Health',
  'World’s largest government-funded health assurance scheme providing cashless hospitalisation cover of up to ₹5 Lakh per family per year.',
  'Deprived rural families and identified occupational categories based on SECC 2011 & NFSA ration database, plus all citizens aged 70+ under Ayushman Vaya Vandana.',
  '["Identified deprived rural households (D1 to D7 criteria under SECC 2011)", "Holders of NFSA / Antyodaya / BPL ration cards in participating states", "Senior citizens aged 70+ under newly expanded Ayushman Vaya Vandana scheme", "Not covered under CGHS, ESIC, or other central/state employee health schemes"]'::jsonb,
  'Cashless hospitalisation and critical care up to ₹5,00,000 per family per year across 28,000+ empanelled public and private hospitals across India.',
  '["Aadhaar Card of each beneficiary", "Ration Card / PMJAY Family Letter", "Active Mobile Number for OTP verification"]'::jsonb,
  'Visit any empanelled hospital (Ayushman Mitra desk) or CSC to get Golden e-Card generated with Aadhaar e-KYC.',
  'https://pmjay.gov.in',
  'All India',
  '14555 / 1800-111-565',
  'verified',
  'National Health Authority Official Portal (pmjay.gov.in)'
),
(
  'pmay-g',
  'Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)',
  'प्रधानमंत्री आवास योजना - ग्रामीण',
  'ప్రధాన మంత్రి ఆవాస్ యోజన - గ్రామీణ',
  'Ministry of Rural Development',
  'Housing',
  'Financial assistance for construction of quality pucca houses with basic amenities (toilet, LPG connection, drinking water) to houseless rural families.',
  'Homeless rural households and families living in zero, one or two-room houses with kutcha wall and kutcha roof.',
  '["Households with no pucca house anywhere in India", "Must be listed in SECC 2011 permanent waitlist or Awaas+ 2024 survey list", "Exclusion: Households owning motorized two/three/four wheelers, mechanized boats, or agricultural machinery", "Exclusion: Households with any member as government servant or income tax payer"]'::jsonb,
  'Unit financial assistance of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult areas, plus 90-95 days unskilled labor wage support under MGNREGA (~₹25,000) and ₹12,000 for Swachh Bharat toilet construction.',
  '["Aadhaar Card", "Active Bank Account details (DBT compliant)", "MGNREGA Job Card Number", "Consent letter from Gram Sabha or land ownership title"]'::jsonb,
  'Registration through Gram Panchayat / Village Secretary via AwaasSoft/Awaas+ portal.',
  'https://pmayg.nic.in',
  'All India',
  '1800-11-6446',
  'verified',
  'Ministry of Rural Development PMAY-G Guidelines, Government of India'
),
(
  'mgnrega',
  'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
  'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम',
  'మహాత్మా గాంధీ జాతీయ గ్రామీణ ఉపాధి హామీ పథకం',
  'Department of Rural Development',
  'Employment',
  'Statutory guarantee of at least 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.',
  'All adult residents of rural India willing to do unskilled physical work.',
  '["Citizen of India residing in rural area under Gram Panchayat jurisdiction", "Must be 18 years of age or above", "Willing to undertake unskilled manual physical labor", "Application submitted for household Job Card"]'::jsonb,
  'Guaranteed 100 days of wage employment per financial year at state notified wage rates (transferred directly into bank/post office account within 15 days).',
  '["Aadhaar Card", "Identity and Residence Proof (Voter Card / Ration Card)", "Bank / Post Office Account passbook", "Passport size photographs of adult members"]'::jsonb,
  'Submit application in writing or orally to Gram Panchayat / Program Officer. Job card issued free of cost within 15 days.',
  'https://nrega.nic.in',
  'All India',
  '1800-345-22-44',
  'verified',
  'The Mahatma Gandhi National Rural Employment Guarantee Act, 2005 Official Act & Guidelines'
),
(
  'nfsa-ration',
  'National Food Security Act (NFSA) - Targeted Public Distribution',
  'राष्ट्रीय खाद्य सुरक्षा अधिनियम - सार्वजनिक वितरण प्रणाली',
  'జాతీయ ఆహార భద్రతా చట్టం - రేషన్ కార్డు సేవలు',
  'Department of Food and Public Distribution, Ministry of Consumer Affairs',
  'Food Security',
  'Subsidized and free foodgrains distribution to Priority Households (PHH) and Antyodaya Anna Yojana (AAY) families through fair price ration shops.',
  'Poorest of the poor families (AAY) and eligible priority rural households identified by state government criteria.',
  '["Rural families without fixed regular income and meeting state poverty criteria", "No family member in permanent government employment", "Does not possess 4-wheeler motor vehicle or large cultivable land exceeding state ceilings"]'::jsonb,
  '5 kg of foodgrains (Rice/Wheat) per person per month for Priority Households, and 35 kg per family per month for Antyodaya (AAY) households, provided free under PMGKAY.',
  '["Aadhaar Card of all family members", "Proof of Residence (Electricity bill, Gram Panchayat certificate)", "Income Certificate issued by Tahsildar / Revenue Department", "Family photograph with head of household"]'::jsonb,
  'Apply online through State Food & Civil Supplies portal or submit form at Mandal Revenue Office / MeeSeva / CSC.',
  'https://nfsa.gov.in',
  'All India',
  '1967 / 1800-180-2087',
  'verified',
  'NFSA Portal nfsa.gov.in and Department of Food & Public Distribution'
),
(
  'pm-ujjwala',
  'Pradhan Mantri Ujjwala Yojana (PMUY 2.0)',
  'प्रधानमंत्री उज्ज्वला योजना 2.0',
  'ప్రధాన మంత్రి ఉజ్జ్వల యోజన 2.0',
  'Ministry of Petroleum and Natural Gas',
  'Women & Child',
  'Deposit-free LPG cylinder connection with free first refill and hotplate stove to adult women from poor rural households.',
  'Adult women belonging to SC/ST households, PMAY, Antyodaya Anna Yojana, Forest dwellers, or poor rural families without existing LPG connection.',
  '["Applicant must be a female aged 18 years or above", "No other LPG connection exists in the same household", "Belongs to eligible 14-point declaration categories of poor rural households"]'::jsonb,
  'Free LPG connection with ₹1,600 government financial assistance (covers cylinder security deposit, regulator, hose, domestic gas booklet) plus first cylinder refill and stove free of cost.',
  '["Aadhaar Card of applicant with current address", "Ration Card confirming family composition", "Bank Account Passbook (IFSC & Account number)", "Supplementary e-KYC"]'::jsonb,
  'Submit application online at pmuy.gov.in or directly to local Indane / Bharat Gas / HP Gas distributor.',
  'https://www.pmuy.gov.in',
  'All India',
  '1800-266-6696 / 1906',
  'verified',
  'PMUY 2.0 Official Portal, MoPNG, GoI'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  summary = EXCLUDED.summary,
  eligibility_criteria = EXCLUDED.eligibility_criteria,
  benefits = EXCLUDED.benefits,
  required_documents = EXCLUDED.required_documents,
  official_url = EXCLUDED.official_url,
  updated_at = NOW();

-- ==============================================================================
-- 16. SEED CURATED PUBLIC SERVICES DATA
-- ==============================================================================
INSERT INTO public.services (id, name, department, category, description, target_audience, required_documents, steps, official_url, delivery_time_days, contact_helpline, review_status)
VALUES
(
  'srv-income-cert',
  'Income Certificate Issuance',
  'Revenue & District Administration',
  'Certificates & Identity',
  'Official proof of household annual income required for scholarships, government welfare schemes, fee concessions, and hospital fee waivers.',
  'All rural citizens requiring legal income certification for family members.',
  '["Aadhaar Card", "Ration Card / Voter ID", "Salary Slip / Income Affidavit / Land Passbook", "Passport Size Photograph"]'::jsonb,
  '["Submit application at nearest Common Service Center (CSC) / Tahsil Office", "Field verification by Village Revenue Officer (VRO) / Revenue Inspector (RI)", "Approval and digital signature by Tahsildar / Deputy Tahsildar", "Download digitally signed certificate with QR code validation"]'::jsonb,
  'https://services.india.gov.in',
  7,
  '1800-425-1110',
  'verified'
),
(
  'srv-caste-cert',
  'Community, Nativity & Caste Certificate',
  'Department of Revenue & Social Welfare',
  'Certificates & Identity',
  'Statutory certificate certifying membership of SC / ST / OBC / BC / EWS categories required for education admissions, reservations, and welfare subsidies.',
  'Citizens belonging to reserved communities or economically weaker sections.',
  '["Aadhaar Card", "Father / Mother or Paternal Relative Caste Certificate", "School Leaving Certificate (TC) showing caste", "Affidavit in prescribed format"]'::jsonb,
  '["Fill online application through State Citizen Portal or CSC center", "Verification of genealogy records by Mandal Revenue Inspector", "Approval by Sub-Divisional Magistrate / Tahsildar", "Permanent barcode-secured certificate issued"]'::jsonb,
  'https://services.india.gov.in',
  15,
  '1800-425-2222',
  'verified'
),
(
  'srv-land-records',
  'Land Record Extract (Pahani / Adangal / RoR 1-B)',
  'Department of Land Administration & Survey',
  'Land & Agriculture',
  'Certified extract of agricultural land ownership, survey numbers, extent of land, crop details, and tenancy records for agricultural loans and subsidies.',
  'Farmers, landholders, and agricultural loan applicants.',
  '["Survey Number / Khata Number", "District, Mandal, and Village name", "Pattadar Passbook or Aadhaar Card"]'::jsonb,
  '["Enter District, Mandal, Village and Survey number on land portal or at CSC", "Pay government nominal user fee (₹25 - ₹35)", "Instantly view and download digitally signed certified RoR / 1-B extract"]'::jsonb,
  'https://bhulekh.gov.in',
  1,
  '1800-425-9999',
  'verified'
),
(
  'srv-ration-service',
  'Ration Card Addition / Modification / Surrender',
  'Food & Civil Supplies Department',
  'Food & Family',
  'Add newborn child or newlywed spouse to family ration card, change address after relocation, or update Aadhaar biometric seeding.',
  'All ration cardholder families.',
  '["Existing Original Ration Card", "Aadhaar Card of member being added", "Birth Certificate (for newborn child) or Marriage Certificate (for spouse)", "Surrender certificate if moving from another district"]'::jsonb,
  '["Submit modification request through CSC with supporting certificates", "Biometric authentication of head of household", "Verification by Assistant Supply Officer (ASO)", "Card updated in electronic PDS database within 15 working days"]'::jsonb,
  'https://nfsa.gov.in',
  15,
  '1967',
  'verified'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  required_documents = EXCLUDED.required_documents,
  steps = EXCLUDED.steps,
  official_url = EXCLUDED.official_url,
  updated_at = NOW();

-- ==============================================================================
-- 17. SEED CURATED NEARBY PUBLIC OFFICES DATA
-- ==============================================================================
INSERT INTO public.offices (id, name, category, address, district, state, pin_code, phone, working_hours, latitude, longitude, official_source, last_reviewed_at)
VALUES
(
  'off-gp-rampoor',
  'Gram Panchayat Office - Rampoor',
  'Gram Panchayat',
  'Main Road, Near Village Water Tank, Rampoor',
  'Warangal',
  'Telangana',
  '506001',
  '0870-2441201',
  '10:00 AM - 05:00 PM (Mon-Sat)',
  17.9689,
  79.5941,
  'Panchayat Raj & Rural Development Department Official Directory',
  NOW()
),
(
  'off-mro-warangal',
  'Tahsildar / Mandal Revenue Office (MRO)',
  'Tahsildar / Mandal Office',
  'Mini Secretariate Complex, Subedari, Warangal Urban',
  'Warangal',
  'Telangana',
  '506001',
  '0870-2578333',
  '10:30 AM - 05:00 PM (Mon-Fri)',
  17.9822,
  79.5977,
  'District Administration Warangal Official Directory',
  NOW()
),
(
  'off-csc-digital',
  'Common Service Center (CSC) - Digital Seva Kendra',
  'Common Service Center (CSC)',
  'Opposite Bus Stand, Rampoor Chowk',
  'Warangal',
  'Telangana',
  '506001',
  '9849012345',
  '09:00 AM - 07:00 PM (All 7 Days)',
  17.9712,
  79.5955,
  'CSC e-Governance Services India Limited Locator',
  NOW()
),
(
  'off-agri-dept',
  'Mandal Agricultural Officer & Rythu Vedika',
  'District Agriculture Office',
  'Rythu Bharosa Kendra, Agricultural Market Yard, Warangal',
  'Warangal',
  'Telangana',
  '506002',
  '0870-2422110',
  '10:00 AM - 05:00 PM (Mon-Sat)',
  17.9754,
  79.6012,
  'Department of Agriculture Official Directory',
  NOW()
),
(
  'off-chc-hospital',
  'Community Health Centre & Ayushman Mitra Desk',
  'Health Center / Hospital',
  'Government Hospital Road, Hanamkonda',
  'Warangal',
  'Telangana',
  '506001',
  '0870-2544222',
  '24 Hours Emergency / OPD: 09:00 AM - 02:00 PM',
  17.9944,
  79.5888,
  'National Health Mission Directorate',
  NOW()
),
(
  'off-post-office',
  'Sub Post Office & India Post Payments Bank',
  'Post Office',
  'Station Road, Near Railway Junction, Warangal',
  'Warangal',
  'Telangana',
  '506002',
  '0870-2420005',
  '09:00 AM - 04:00 PM (Mon-Sat)',
  17.9655,
  79.6088,
  'India Post Official Directory',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
