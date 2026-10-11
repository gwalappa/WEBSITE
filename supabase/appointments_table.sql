-- ==============================================================================
-- SMILE ARCHITECT DENTAL CLINIC - SUPABASE APPOINTMENTS SETUP
-- Project ID: egccbzkmprexuhkhixep
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/egccbzkmprexuhkhixep/sql/new
-- ==============================================================================

-- 1. Create the appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT,
  service_id TEXT,
  service_name TEXT NOT NULL,
  service_duration INTEGER DEFAULT 30,
  dentist_id TEXT,
  dentist_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  patient_notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for fast lookups by booking reference and date
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON public.appointments(booking_reference);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date, dentist_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies so that public booking and staff portal work smoothly
DROP POLICY IF EXISTS "Allow public insert appointments" ON public.appointments;
CREATE POLICY "Allow public insert appointments"
  ON public.appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select appointments" ON public.appointments;
CREATE POLICY "Allow public select appointments"
  ON public.appointments
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow public update appointments" ON public.appointments;
CREATE POLICY "Allow public update appointments"
  ON public.appointments
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- 5. Optional: Table for contact form enquiries
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert contact" ON public.contact_enquiries;
CREATE POLICY "Allow public insert contact"
  ON public.contact_enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
