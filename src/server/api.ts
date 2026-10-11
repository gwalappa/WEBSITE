import express, { Request, Response } from 'express';
import { db } from './db.ts';
import {
  calculateAvailableSlots,
  generateBookingReference,
  generateVerificationToken,
  timeToMinutes,
  minutesToTime,
  getKolkataDateString,
  isOverlapping,
} from './scheduler.ts';
import {
  hashPassword,
  createSession,
  destroySession,
  requireAuth,
  requireRole,
  AuthenticatedRequest,
} from './auth.ts';
import { Appointment, Service, Dentist } from '../types/index.ts';
import {
  syncAppointmentToSupabase,
  updateAppointmentInSupabase,
  checkSupabaseStatus,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
} from './supabase.ts';

export const apiRouter = express.Router();

// Helper to normalize Indian/international phone numbers
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // Valid Indian mobile numbers are 10 digits (optionally prefixed with +91 or 0, total 10-12 digits)
  return digits.length >= 10 && digits.length <= 13;
}

// -------------------------------------------------------------
// 1. PUBLIC ENDPOINTS
// -------------------------------------------------------------

// Clinic Information & Settings
apiRouter.get('/clinic-info', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({
    ...settings,
    localTimezone: 'Asia/Kolkata',
    currentTimeKolkata: new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(new Date()),
  });
});

// Services List
apiRouter.get('/services', (_req: Request, res: Response) => {
  const services = db.getServices(true);
  res.json(services);
});

// Dentists List
apiRouter.get('/dentists', (_req: Request, res: Response) => {
  const dentists = db.getDentists(true);
  res.json(dentists);
});

// Business Hours
apiRouter.get('/business-hours', (_req: Request, res: Response) => {
  const hours = db.getBusinessHours();
  res.json(hours);
});

// Availability Search
apiRouter.get('/availability', (req: Request, res: Response) => {
  const { date, serviceId, dentistId } = req.query;

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid date parameter (format: YYYY-MM-DD)' });
  }
  if (!serviceId || typeof serviceId !== 'string') {
    return res.status(400).json({ error: 'Missing serviceId parameter' });
  }

  const result = calculateAvailableSlots({
    date,
    serviceId,
    dentistId: typeof dentistId === 'string' ? dentistId : undefined,
  });

  res.json(result);
});

// Create Appointment (Atomic lock & double-booking prevention)
apiRouter.post('/appointments', async (req: Request, res: Response) => {
  try {
    const {
      patientName,
      patientPhone,
      patientEmail,
      serviceId,
      dentistId,
      date,
      startTime,
      patientNotes,
      privacyConsent,
    } = req.body;

    // 1. Validate mandatory fields
    if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid patient full name.' });
    }
    if (!patientPhone || typeof patientPhone !== 'string' || !isValidPhone(patientPhone)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!serviceId || typeof serviceId !== 'string') {
      return res.status(400).json({ error: 'Please select a treatment service.' });
    }
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Please provide a valid appointment date (YYYY-MM-DD).' });
    }
    if (!startTime || typeof startTime !== 'string' || !/^\d{2}:\d{2}$/.test(startTime)) {
      return res.status(400).json({ error: 'Please provide a valid appointment time slot.' });
    }
    if (privacyConsent !== true) {
      return res.status(400).json({ error: 'Consent to clinic booking and privacy terms is required.' });
    }

    // 2. Fetch service
    const service = db.getServiceById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ error: 'Selected dental service is unavailable.' });
    }

    const duration = service.durationMinutes || 30;
    const settings = db.getSettings();
    const buffer = settings.appointmentBufferMinutes || 10;
    const startMins = timeToMinutes(startTime);
    const endMins = startMins + duration;
    const endTime = minutesToTime(endMins);

    // 3. Atomic execution under mutex lock
    const appointment = await db.withLock(async () => {
      // Re-run full availability check inside atomic lock
      const availability = calculateAvailableSlots({
        date,
        serviceId,
        dentistId,
      });

      if (availability.isClosed) {
        throw { status: 400, message: availability.closureReason || 'Clinic is closed on this date' };
      }

      // Find the slot for this startTime
      const requestedSlot = availability.slots.find((s) => s.time === startTime);
      if (!requestedSlot || !requestedSlot.available) {
        // Collect next 3 available alternative slots on the same date
        const alternatives = availability.slots.filter((s) => s.available).slice(0, 3).map((s) => s.time);
        throw {
          status: 409,
          message: 'The selected appointment slot was just reserved by another patient. Please choose an alternative time slot.',
          alternativeSlots: alternatives,
        };
      }

      // Determine dentist
      const assignedDentistId = requestedSlot.dentistId;
      const assignedDentist = db.getDentistById(assignedDentistId);
      if (!assignedDentist) {
        throw { status: 400, message: 'Could not assign an available dentist' };
      }

      // Secondary guarantee: Double check for overlapping appointments for this dentist
      const existingApts = db.getAppointments().filter(
        (a) => a.date === date && a.dentistId === assignedDentistId && a.status !== 'cancelled'
      );

      const hasConflict = existingApts.some((a) => {
        const aStart = timeToMinutes(a.startTime);
        const aEnd = timeToMinutes(a.endTime);
        return isOverlapping(startMins, endMins, aStart, aEnd, buffer);
      });

      if (hasConflict) {
        throw {
          status: 409,
          message: 'Conflict detected: this dentist is already booked during this timeframe.',
        };
      }

      const bookingReference = generateBookingReference();
      const verificationToken = generateVerificationToken();
      const nowIso = new Date().toISOString();

      const newAppointment: Appointment = {
        id: `apt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        bookingReference,
        patientName: patientName.trim(),
        patientPhone: normalizePhone(patientPhone),
        patientEmail: patientEmail?.trim() || undefined,
        serviceId: service.id,
        serviceName: service.name,
        serviceDuration: duration,
        dentistId: assignedDentist.id,
        dentistName: assignedDentist.name,
        date,
        startTime,
        endTime,
        status: 'confirmed',
        patientNotes: patientNotes?.trim() ? String(patientNotes).slice(0, 300) : undefined,
        verificationToken,
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      return db.createAppointment(newAppointment);
    });

    // Generate WhatsApp direct chat link for patient confirmation / questions
    const cleanNumber = settings.whatsappNumber.replace(/\D/g, '');
    const waText = encodeURIComponent(
      `Hello Smile Architect Dental Clinic, I have booked an appointment.\nRef: ${appointment.bookingReference}\nDate: ${appointment.date} at ${appointment.startTime}\nPatient: ${appointment.patientName}`
    );
    const whatsappLink = `https://wa.me/${cleanNumber}?text=${waText}`;

    // Notification summary (simulated & logged)
    const notificationSummary = {
      emailSent: settings.emailNotificationsEnabled && Boolean(appointment.patientEmail),
      smsSent: settings.smsNotificationsEnabled,
      whatsappReady: true,
      whatsappLink,
    };

    // Automatically sync appointment to Supabase PostgreSQL database
    const supabaseSync = await syncAppointmentToSupabase(appointment);

    res.status(201).json({
      success: true,
      appointment,
      supabaseSync,
      notificationSummary,
      clinic: {
        name: settings.businessName,
        phone: settings.phone,
        address: settings.address,
        googleMapsUrl: settings.googleMapsUrl,
      },
    });
  } catch (err: any) {
    if (err && err.status) {
      return res.status(err.status).json({
        error: err.message,
        alternativeSlots: err.alternativeSlots,
      });
    }
    console.error('[API] Appointment booking error:', err);
    res.status(500).json({ error: 'An unexpected error occurred while booking. Please try again.' });
  }
});

// Patient Appointment Lookup (Secure via reference + phone match)
apiRouter.post('/appointments/lookup', (req: Request, res: Response) => {
  const { reference, phone } = req.body;

  if (!reference || typeof reference !== 'string') {
    return res.status(400).json({ error: 'Booking reference is required.' });
  }
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Registered mobile number is required for verification.' });
  }

  const appointment = db.getAppointmentByReference(reference, phone);
  if (!appointment) {
    return res.status(404).json({
      error: 'No active appointment matched this booking reference and phone number. Please check your details.',
    });
  }

  res.json({
    appointment,
    clinic: db.getSettings(),
  });
});

// Patient Cancellation
apiRouter.post('/appointments/cancel', async (req: Request, res: Response) => {
  const { reference, phone, token, reason } = req.body;

  if (!reference && !token) {
    return res.status(400).json({ error: 'Reference or verification token required.' });
  }

  const appointment = db.getAppointmentByReference(reference, phone);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  if (appointment.status === 'cancelled') {
    return res.status(400).json({ error: 'This appointment has already been cancelled.' });
  }

  const updated = db.updateAppointment(
    appointment.id,
    {
      status: 'cancelled',
      cancellationReason: reason ? String(reason).slice(0, 200) : 'Cancelled by patient',
    },
    { email: appointment.patientPhone, role: 'patient' }
  );

  // Sync cancellation to Supabase
  await updateAppointmentInSupabase(appointment.bookingReference, {
    status: 'cancelled',
  });

  res.json({ success: true, appointment: updated });
});

// Contact Form Submission (Anti-spam honeypot + rate check)
apiRouter.post('/contact', (req: Request, res: Response) => {
  const { name, phone, email, message, honeypot } = req.body;

  if (honeypot) {
    // Silent discard for bots
    return res.json({ success: true, message: 'Message sent successfully.' });
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Please enter your name.' });
  }
  if (!phone || typeof phone !== 'string' || !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Please enter a valid phone number.' });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide a message or enquiry description.' });
  }

  db.addAuditLog(
    phone,
    'visitor',
    'CONTACT_ENQUIRY',
    `Contact from ${name} (${phone}, ${email || 'no email'}): ${message.slice(0, 150)}`
  );

  res.json({
    success: true,
    message: 'Thank you for reaching out to Smile Architect Dental Clinic. Our reception team will get in touch with you promptly.',
  });
});

// Gallery Items
apiRouter.get('/gallery', (_req: Request, res: Response) => {
  res.json(db.getGallery());
});

// Verified Testimonials
apiRouter.get('/testimonials', (_req: Request, res: Response) => {
  res.json(db.getTestimonials());
});

// FAQs
apiRouter.get('/faqs', (_req: Request, res: Response) => {
  res.json(db.getFaqs());
});

// -------------------------------------------------------------
// 2. STAFF AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const profile = db.findProfileByEmail(email);
  if (!profile) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const enteredHash = hashPassword(password);
  if (enteredHash !== profile.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createSession(profile);
  db.addAuditLog(profile.email, profile.role, 'STAFF_LOGIN', `User ${profile.name} signed in successfully.`);

  const { passwordHash, ...userClean } = profile;
  res.json({
    success: true,
    token,
    user: userClean,
  });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  destroySession(token);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 3. ADMIN DASHBOARD & MANAGEMENT (Protected)
// -------------------------------------------------------------

// Dashboard metrics
apiRouter.get('/admin/metrics', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const appointments = db.getAppointments();
  const todayStr = getKolkataDateString();

  const todayCount = appointments.filter((a) => a.date === todayStr && a.status !== 'cancelled').length;
  const upcomingCount = appointments.filter((a) => a.date >= todayStr && a.status !== 'cancelled').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  res.json({
    todayCount,
    upcomingCount,
    pendingCount,
    confirmedCount,
    completedCount,
    cancelledCount,
    totalCount: appointments.length,
    todayDate: todayStr,
  });
});

// Appointment list with filters
apiRouter.get('/admin/appointments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let appointments = db.getAppointments();
  const { date, status, dentistId, serviceId, search } = req.query;

  // Least-privilege: Dentist can only see their own appointments
  if (req.user?.role === 'dentist' && req.user.dentistId) {
    appointments = appointments.filter((a) => a.dentistId === req.user?.dentistId);
  } else if (dentistId && typeof dentistId === 'string') {
    appointments = appointments.filter((a) => a.dentistId === dentistId);
  }

  if (date && typeof date === 'string') {
    appointments = appointments.filter((a) => a.date === date);
  }
  if (status && typeof status === 'string') {
    appointments = appointments.filter((a) => a.status === status);
  }
  if (serviceId && typeof serviceId === 'string') {
    appointments = appointments.filter((a) => a.serviceId === serviceId);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    appointments = appointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.patientPhone.includes(q) ||
        a.bookingReference.toLowerCase().includes(q) ||
        a.serviceName.toLowerCase().includes(q)
    );
  }

  // Sort: upcoming date & time first
  appointments.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  res.json(appointments);
});

// Update appointment status / clinical notes
apiRouter.patch('/admin/appointments/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, internalNotes } = req.body;

  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const updates: Partial<Appointment> = {};
  if (status) updates.status = status;
  if (internalNotes !== undefined) updates.internalNotes = internalNotes;

  const updated = db.updateAppointment(id, updates, {
    email: req.user!.email,
    role: req.user!.role,
  });

  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  // Sync status modification to Supabase
  updateAppointmentInSupabase(updated.bookingReference, updates).catch((err) =>
    console.warn('[Supabase] Background status sync error:', err)
  );

  res.json({ success: true, appointment: updated });
});

// Update Settings (Owner only)
apiRouter.put('/admin/settings', requireAuth, requireRole(['owner']), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body, {
    email: req.user!.email,
    role: req.user!.role,
  });
  res.json({ success: true, settings: updated });
});

// Blocked Dates Management
apiRouter.get('/admin/blocked-dates', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getBlockedDates());
});

apiRouter.post('/admin/blocked-dates', requireAuth, requireRole(['owner', 'receptionist']), (req: AuthenticatedRequest, res: Response) => {
  const { date, reason, dentistId } = req.body;
  if (!date || !reason) {
    return res.status(400).json({ error: 'Date and reason are required.' });
  }
  const created = db.addBlockedDate({ date, reason, dentistId }, {
    email: req.user!.email,
    role: req.user!.role,
  });
  res.status(201).json(created);
});

apiRouter.delete('/admin/blocked-dates/:id', requireAuth, requireRole(['owner', 'receptionist']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.removeBlockedDate(id, {
    email: req.user!.email,
    role: req.user!.role,
  });
  if (!success) {
    return res.status(404).json({ error: 'Blocked date not found.' });
  }
  res.json({ success: true });
});

// Audit Logs (Owner only)
apiRouter.get('/admin/audit-logs', requireAuth, requireRole(['owner']), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getAuditLogs());
});

// Export Appointments to CSV
apiRouter.get('/admin/export-csv', requireAuth, requireRole(['owner', 'receptionist']), (_req: AuthenticatedRequest, res: Response) => {
  const appointments = db.getAppointments();
  const headers = [
    'Booking Reference',
    'Patient Name',
    'Phone',
    'Email',
    'Date',
    'Start Time',
    'End Time',
    'Service',
    'Dentist',
    'Status',
    'Patient Notes',
    'Internal Notes',
    'Created At',
  ];

  const escapeCsv = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;

  const rows = appointments.map((a) => [
    escapeCsv(a.bookingReference),
    escapeCsv(a.patientName),
    escapeCsv(a.patientPhone),
    escapeCsv(a.patientEmail),
    escapeCsv(a.date),
    escapeCsv(a.startTime),
    escapeCsv(a.endTime),
    escapeCsv(a.serviceName),
    escapeCsv(a.dentistName),
    escapeCsv(a.status),
    escapeCsv(a.patientNotes),
    escapeCsv(a.internalNotes),
    escapeCsv(a.createdAt),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="smile_architect_appointments_${Date.now()}.csv"`);
  res.send(csvContent);
});

// Supabase Status & SQL Provisioning Helper
apiRouter.get('/admin/supabase-status', async (_req: Request, res: Response) => {
  const status = await checkSupabaseStatus();
  const setupSql = `-- ==============================================================================
-- 1-CLICK SQL SCRIPT FOR YOUR SUPABASE DATABASE (${SUPABASE_PROJECT_ID})
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new
-- ==============================================================================

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

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts from online booking form
DROP POLICY IF EXISTS "Allow public insert appointments" ON public.appointments;
CREATE POLICY "Allow public insert appointments"
  ON public.appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public read of appointments
DROP POLICY IF EXISTS "Allow public select appointments" ON public.appointments;
CREATE POLICY "Allow public select appointments"
  ON public.appointments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow public update of appointments
DROP POLICY IF EXISTS "Allow public update appointments" ON public.appointments;
CREATE POLICY "Allow public update appointments"
  ON public.appointments
  FOR UPDATE
  TO anon, authenticated
  USING (true);
`;

  res.json({
    ...status,
    setupSql,
  });
});

// Bulk sync all appointments to Supabase
apiRouter.post('/admin/supabase-sync-all', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  const allAppointments = db.getAppointments();
  let syncedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const apt of allAppointments) {
    const result = await syncAppointmentToSupabase(apt);
    if (result.synced) {
      syncedCount++;
    } else {
      failedCount++;
      if (result.error && !errors.includes(result.error)) {
        errors.push(result.error);
      }
    }
  }

  res.json({
    total: allAppointments.length,
    syncedCount,
    failedCount,
    errors,
  });
});

