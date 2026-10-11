import crypto from 'crypto';
import { db } from './db.ts';
import { Appointment, Service, Dentist, TimeSlot } from '../types/index.ts';

// Helper: Convert "HH:mm" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: Convert minutes from midnight to "HH:mm"
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Helper: Get today's date string in Asia/Kolkata timezone (YYYY-MM-DD)
export function getKolkataDateString(dateObj: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

// Helper: Get current time in Asia/Kolkata in minutes
export function getKolkataCurrentMinutes(): number {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === 'hour')?.value || 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value || 0);
  return h * 60 + m;
}

// Check if two time ranges overlap (inclusive buffer)
export function isOverlapping(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
  bufferMinutes: number = 0
): boolean {
  // A ends after B starts AND A starts before B ends + buffer
  return startA < endB + bufferMinutes && endA + bufferMinutes > startB;
}

export interface AvailabilityQuery {
  date: string; // YYYY-MM-DD
  serviceId: string;
  dentistId?: string; // or 'any'
}

export function calculateAvailableSlots(query: AvailabilityQuery): {
  slots: TimeSlot[];
  isClosed: boolean;
  closureReason?: string;
} {
  const settings = db.getSettings();
  const service = db.getServiceById(query.serviceId);
  if (!service) {
    return { slots: [], isClosed: true, closureReason: 'Invalid service selected' };
  }

  const duration = service.durationMinutes || 30;
  const buffer = settings.appointmentBufferMinutes || 10;
  const targetDateStr = query.date;

  // 1. Check booking horizon
  const todayStr = getKolkataDateString();
  const todayDate = new Date(todayStr);
  const targetDate = new Date(targetDateStr);
  const diffDays = Math.ceil((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { slots: [], isClosed: true, closureReason: 'Past dates cannot be booked' };
  }
  if (diffDays > settings.bookingHorizonDays) {
    return {
      slots: [],
      isClosed: true,
      closureReason: `Appointments can only be booked up to ${settings.bookingHorizonDays} days in advance`,
    };
  }

  // 2. Check blocked holidays / emergency closures
  const blockedDates = db.getBlockedDates();
  const blocked = blockedDates.find((b) => b.date === targetDateStr && (!b.dentistId || b.dentistId === query.dentistId));
  if (blocked) {
    return { slots: [], isClosed: true, closureReason: `Clinic closed on this date: ${blocked.reason}` };
  }

  // 3. Determine day of week for targetDate
  // Parse year, month, day to construct UTC date matching YYYY-MM-DD
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  // Check business hours
  const businessHours = db.getBusinessHours();
  const daySchedule = businessHours.find((bh) => bh.dayOfWeek === targetDayOfWeek);
  if (!daySchedule || !daySchedule.isOpen) {
    return { slots: [], isClosed: true, closureReason: 'Clinic is closed on this day of the week' };
  }

  // 4. Dentists to consider
  const allDentists = db.getDentists(true);
  let eligibleDentists: Dentist[] = [];

  if (query.dentistId && query.dentistId !== 'any') {
    const specific = allDentists.find((d) => d.id === query.dentistId);
    if (!specific) {
      return { slots: [], isClosed: true, closureReason: 'Selected dentist is not active' };
    }
    if (!specific.workingDays.includes(targetDayOfWeek)) {
      return { slots: [], isClosed: true, closureReason: `${specific.name} does not practice on this day` };
    }
    eligibleDentists = [specific];
  } else {
    // "Any dentist": only those working on this day of week
    eligibleDentists = allDentists.filter((d) => d.workingDays.includes(targetDayOfWeek));
    if (eligibleDentists.length === 0) {
      return { slots: [], isClosed: true, closureReason: 'No dentists available on this day' };
    }
  }

  // 5. Existing active appointments on target date
  const allAppointments = db.getAppointments();
  const dateAppointments = allAppointments.filter(
    (a) => a.date === targetDateStr && a.status !== 'cancelled'
  );

  // 6. Define daily clinic operating sessions
  const sessions: { startMins: number; endMins: number }[] = [];
  if (daySchedule.morningOpen && daySchedule.morningClose) {
    sessions.push({
      startMins: timeToMinutes(daySchedule.morningOpen),
      endMins: timeToMinutes(daySchedule.morningClose),
    });
  }
  if (daySchedule.eveningOpen && daySchedule.eveningClose) {
    sessions.push({
      startMins: timeToMinutes(daySchedule.eveningOpen),
      endMins: timeToMinutes(daySchedule.eveningClose),
    });
  }

  // Calculate minimum advance booking notice for today
  const isToday = targetDateStr === todayStr;
  const currentKolkataMins = getKolkataCurrentMinutes();
  const minEarliestMins = isToday ? currentKolkataMins + settings.minNoticeHours * 60 : 0;

  // 7. Generate slots at 15-minute intervals throughout sessions
  const slotIntervalMins = 15;
  const generatedSlots: TimeSlot[] = [];

  for (const session of sessions) {
    for (
      let slotStart = session.startMins;
      slotStart + duration <= session.endMins;
      slotStart += slotIntervalMins
    ) {
      const slotEnd = slotStart + duration;

      // Notice constraint: Must be in future if today
      if (isToday && slotStart < minEarliestMins) {
        continue;
      }

      // Check which eligible dentist is free for [slotStart, slotEnd]
      let assignedDentist: Dentist | null = null;

      for (const dentist of eligibleDentists) {
        // Check if this dentist has overlapping booking on this day
        const dentistApts = dateAppointments.filter((a) => a.dentistId === dentist.id);
        const hasConflict = dentistApts.some((a) => {
          const aptStart = timeToMinutes(a.startTime);
          const aptEnd = timeToMinutes(a.endTime);
          return isOverlapping(slotStart, slotEnd, aptStart, aptEnd, buffer);
        });

        if (!hasConflict) {
          assignedDentist = dentist;
          break; // Found an available dentist!
        }
      }

      generatedSlots.push({
        time: minutesToTime(slotStart),
        available: assignedDentist !== null,
        dentistId: assignedDentist ? assignedDentist.id : eligibleDentists[0].id,
        dentistName: assignedDentist ? assignedDentist.name : eligibleDentists[0].name,
        reason: assignedDentist ? undefined : 'Slot fully booked',
      });
    }
  }

  return {
    slots: generatedSlots,
    isClosed: false,
  };
}

// Generate secure booking reference (e.g. SMILE-7821-MY)
export function generateBookingReference(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const randomChar = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `SMILE-${randomNum}-${randomChar}`;
}

// Generate secure random verification token for patient management
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
