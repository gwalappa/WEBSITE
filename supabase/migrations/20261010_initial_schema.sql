-- ==============================================================================
-- SMILE ARCHITECT DENTAL CLINIC - POSTGRESQL & SUPABASE MIGRATION SCHEMA
-- ==============================================================================
-- Database: PostgreSQL 15+ / Supabase
-- Target Timezone: Asia/Kolkata
-- Description: Core tables, foreign keys, constraints, Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Staff Profiles & Roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE, -- References auth.users(id) in Supabase
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'receptionist', 'dentist')),
  dentist_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Business Settings
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL DEFAULT 'Smile Architect Dental Clinic',
  tagline VARCHAR(255) DEFAULT 'Your Smile Deserves Expert Care',
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp_number VARCHAR(50) NOT NULL,
  google_maps_url TEXT NOT NULL,
  google_rating NUMERIC(2, 1) DEFAULT 4.8,
  review_count INTEGER DEFAULT 150,
  booking_horizon_days INTEGER DEFAULT 30,
  min_notice_hours INTEGER DEFAULT 2,
  appointment_buffer_minutes INTEGER DEFAULT 10,
  primary_color VARCHAR(20) DEFAULT '#0B6B68',
  secondary_color VARCHAR(20) DEFAULT '#DDF4F0',
  email_notifications_enabled BOOLEAN DEFAULT true,
  sms_notifications_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Dentists
CREATE TABLE IF NOT EXISTS dentists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  qualifications VARCHAR(255) NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  languages TEXT[] DEFAULT '{"Kannada", "English"}',
  bio TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  consultation_fee NUMERIC(10, 2), -- Optional / unconfirmed
  fee_notice TEXT,
  is_bookable_online BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Dentist-Service Relationships
CREATE TABLE IF NOT EXISTS dentist_services (
  dentist_id UUID NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (dentist_id, service_id)
);

-- 7. Business Operating Hours
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon...
  is_open BOOLEAN NOT NULL DEFAULT true,
  morning_open TIME NOT NULL DEFAULT '10:00:00',
  morning_close TIME NOT NULL DEFAULT '13:30:00',
  evening_open TIME DEFAULT '17:00:00',
  evening_close TIME DEFAULT '20:30:00',
  UNIQUE(day_of_week)
);

-- 8. Dentist Working Schedules
CREATE TABLE IF NOT EXISTS dentist_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dentist_id UUID NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_working BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(dentist_id, day_of_week)
);

-- 9. Blocked Dates & Emergency Closures
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_date DATE NOT NULL,
  reason VARCHAR(255) NOT NULL,
  dentist_id UUID REFERENCES dentists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Appointments Table with Constraints
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  patient_name VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(50) NOT NULL,
  patient_email VARCHAR(255),
  service_id UUID NOT NULL REFERENCES services(id),
  dentist_id UUID NOT NULL REFERENCES dentists(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  patient_notes TEXT,
  internal_notes TEXT,
  verification_token VARCHAR(128) NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_times CHECK (end_time > start_time)
);

-- Index for speedy conflict checking
CREATE INDEX IF NOT EXISTS idx_appointments_slot ON appointments(dentist_id, appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_lookup ON appointments(booking_reference, patient_phone);

-- 11. Notification Records
CREATE TABLE IF NOT EXISTS notification_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  recipient VARCHAR(255) NOT NULL,
  channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  template VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'delivered' CHECK (status IN ('queued', 'sent', 'delivered', 'failed')),
  error_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Gallery Images
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('interior', 'operatory', 'equipment', 'consultation')),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name VARCHAR(255) NOT NULL,
  treatment VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  source VARCHAR(100) NOT NULL DEFAULT 'Google Review',
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_email VARCHAR(255) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentists ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Public can read public metadata
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active dentists" ON dentists FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view business settings" ON business_settings FOR SELECT USING (true);
CREATE POLICY "Public can view business hours" ON business_hours FOR SELECT USING (true);
CREATE POLICY "Public can view gallery images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Public can view verified testimonials" ON testimonials FOR SELECT USING (is_verified = true);

-- Appointments RLS: Public cannot dump all appointments!
-- Public can only insert a booking through server or look up their specific record with verification token
CREATE POLICY "Public can insert appointment" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view appointments" ON appointments FOR SELECT USING (
  auth.role() = 'authenticated'
);
CREATE POLICY "Staff can update appointments" ON appointments FOR UPDATE USING (
  auth.role() = 'authenticated'
);

-- Audit events: staff only
CREATE POLICY "Staff can view audit events" ON audit_events FOR SELECT USING (
  auth.role() = 'authenticated'
);
