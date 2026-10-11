export type StaffRole = 'owner' | 'receptionist' | 'dentist';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  dentistId?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  durationMinutes: number;
  consultationFee?: number; // unconfirmed or hidden if not provided
  feeNotice?: string; // e.g. "Discussed transparently during in-clinic consultation"
  isBookableOnline: boolean;
  isActive: boolean;
}

export interface Dentist {
  id: string;
  name: string;
  qualifications: string;
  specializations: string[];
  experienceYears?: number;
  languages: string[];
  bio: string;
  photoUrl?: string;
  isActive: boolean;
  workingDays: number[]; // 0=Sunday, 1=Monday...
}

export interface BusinessHours {
  dayOfWeek: number; // 0=Sun, 1=Mon...
  isOpen: boolean;
  morningOpen: string; // e.g. "10:00"
  morningClose: string; // e.g. "13:30"
  eveningOpen?: string; // e.g. "17:00"
  eveningClose?: string; // e.g. "20:30"
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  dentistId?: string; // if blocked only for specific dentist, or all
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  bookingReference: string; // e.g. SMILE-4829-MY
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  dentistId: string;
  dentistName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  patientNotes?: string;
  internalNotes?: string;
  verificationToken: string; // secure hash token for patient view/cancel
  tokenExpiresAt: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicSettings {
  businessName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  googleMapsUrl: string;
  googleRating: number;
  reviewCount: number;
  primaryColor: string;
  secondaryColor: string;
  bookingHorizonDays: number; // e.g. 30 days
  minNoticeHours: number; // e.g. 2 hours
  appointmentBufferMinutes: number; // e.g. 10 minutes
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  whatsappEnabled: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'interior' | 'operatory' | 'equipment' | 'consultation';
  imageUrl: string;
  caption: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  treatment: string;
  comment: string;
  source: 'Google Review' | 'Verified In-Clinic Patient';
  date: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  details: string;
}

export interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
  dentistId: string;
  dentistName: string;
  reason?: string;
}
