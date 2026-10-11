import { createClient } from '@supabase/supabase-js';
import type { Appointment } from '../types/index.ts';

// Supabase project credentials provided by the clinic
export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'egccbzkmprexuhkhixep';
export const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_nIfTNVoPW6tpeMnlFyMfiw_aWkzFIy-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface SupabaseSyncResult {
  synced: boolean;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Automatically sync a new appointment to Supabase PostgreSQL database
 */
export async function syncAppointmentToSupabase(appointment: Appointment): Promise<SupabaseSyncResult> {
  try {
    const payload = {
      id: appointment.id,
      booking_reference: appointment.bookingReference,
      patient_name: appointment.patientName,
      patient_phone: appointment.patientPhone,
      patient_email: appointment.patientEmail || null,
      service_id: appointment.serviceId,
      service_name: appointment.serviceName,
      service_duration: appointment.serviceDuration,
      dentist_id: appointment.dentistId,
      dentist_name: appointment.dentistName,
      appointment_date: appointment.date,
      start_time: appointment.startTime,
      end_time: appointment.endTime,
      status: appointment.status,
      patient_notes: appointment.patientNotes || null,
      internal_notes: appointment.internalNotes || null,
      created_at: appointment.createdAt,
      updated_at: appointment.updatedAt,
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert([payload])
      .select();

    if (error) {
      console.warn('[Supabase] Warning syncing appointment:', error.message, error.code);
      return {
        synced: false,
        error: error.message,
        code: error.code,
      };
    }

    console.log('[Supabase] Successfully saved appointment to Supabase table:', appointment.bookingReference);
    return {
      synced: true,
      message: 'Successfully saved to Supabase appointments table',
    };
  } catch (err: any) {
    console.error('[Supabase] Unexpected error in syncAppointmentToSupabase:', err);
    return {
      synced: false,
      error: err?.message || 'Network error syncing to Supabase',
    };
  }
}

/**
 * Sync status updates (e.g. cancelled, confirmed, completed) to Supabase
 */
export async function updateAppointmentInSupabase(
  bookingReference: string,
  updates: Partial<Appointment>
): Promise<SupabaseSyncResult> {
  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) payload.status = updates.status;
    if (updates.internalNotes !== undefined) payload.internal_notes = updates.internalNotes;
    if (updates.date) payload.appointment_date = updates.date;
    if (updates.startTime) payload.start_time = updates.startTime;
    if (updates.endTime) payload.end_time = updates.endTime;

    const { error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('booking_reference', bookingReference);

    if (error) {
      console.warn('[Supabase] Update failed in Supabase:', error.message);
      return { synced: false, error: error.message, code: error.code };
    }

    return { synced: true, message: 'Updated in Supabase' };
  } catch (err: any) {
    return { synced: false, error: err?.message };
  }
}

/**
 * Check connectivity and whether the appointments table is active in the user's Supabase project
 */
export async function checkSupabaseStatus() {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (error) {
      return {
        connected: true,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        tableExists: false,
        error: error.message,
        code: error.code,
        hint: error.code === 'PGRST205'
          ? 'The appointments table needs to be created in your Supabase SQL editor.'
          : error.message,
      };
    }

    return {
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tableExists: true,
      hint: 'Connected and ready! Appointments are syncing directly to Supabase.',
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tableExists: false,
      error: err?.message,
    };
  }
}
