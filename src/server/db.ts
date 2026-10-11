import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UserProfile,
  Service,
  Dentist,
  BusinessHours,
  BlockedDate,
  Appointment,
  ClinicSettings,
  GalleryItem,
  Testimonial,
  FAQItem,
  AuditLog,
} from '../types/index.ts';

interface DatabaseSchema {
  settings: ClinicSettings;
  profiles: (UserProfile & { passwordHash: string })[];
  services: Service[];
  dentists: Dentist[];
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  appointments: Appointment[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'clinic_store.json');

// Initial verified seed data
const initialData: DatabaseSchema = {
  settings: {
    businessName: 'Smile Architect Dental Clinic',
    tagline: 'Your Smile Deserves Expert Care',
    address: '850/S, 25th Cross Road, Manchegowdana Koppalu, Sankranthi Circle, Hebbal 2nd Stage, Mysuru, Karnataka 570017, India',
    phone: '+91 90368 27916',
    whatsappNumber: '919036827916',
    googleMapsUrl: 'https://maps.app.goo.gl/m6FKojfRqpNL3FDQ8',
    googleRating: 4.8,
    reviewCount: 150,
    primaryColor: '#0B6B68',
    secondaryColor: '#DDF4F0',
    bookingHorizonDays: 30,
    minNoticeHours: 2,
    appointmentBufferMinutes: 10,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    whatsappEnabled: true,
  },
  profiles: [
    {
      id: 'usr_owner_01',
      email: 'admin@smilearchitect.com',
      name: 'Clinic Administrator',
      role: 'owner',
      passwordHash: crypto.createHash('sha256').update('adminpassword123').digest('hex'),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_rec_01',
      email: 'reception@smilearchitect.com',
      name: 'Front Desk Reception',
      role: 'receptionist',
      passwordHash: crypto.createHash('sha256').update('receptionpass123').digest('hex'),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_doc_01',
      email: 'dentist@smilearchitect.com',
      name: 'Dr. Smile Architect',
      role: 'dentist',
      dentistId: 'doc_01',
      passwordHash: crypto.createHash('sha256').update('dentistpass123').digest('hex'),
      createdAt: new Date().toISOString(),
    },
  ],
  services: [
    {
      id: 'srv_gen_consult',
      name: 'General Dental Consultation',
      category: 'Diagnostic & Preventive',
      shortDescription: 'Comprehensive dental checkup, bite assessment, and personalized treatment plan.',
      fullDescription: 'Our foundational consultation includes thorough visual inspection of teeth, gums, and oral soft tissues, gentle screening for cavities, and clear guidance on preventive oral health.',
      durationMinutes: 30,
      feeNotice: 'Standard in-clinic consultation fee applies. Transparent pricing provided during visit.',
      isBookableOnline: true,
      isActive: true,
    },
    {
      id: 'srv_scaling',
      name: 'Teeth Cleaning & Ultrasonic Scaling',
      category: 'Diagnostic & Preventive',
      shortDescription: 'Gentle ultrasonic plaque and tartar removal for healthy gums and fresh breath.',
      fullDescription: 'Professional ultrasonic prophylaxis clears stubborn calculus and surface staining around gumlines without damaging tooth enamel. Recommended every 6 months.',
      durationMinutes: 45,
      feeNotice: 'Transparent fee discussed based on calculus grade.',
      isBookableOnline: true,
      isActive: true,
    },
    {
      id: 'srv_fillings',
      name: 'Cavity Treatment & Composite Fillings',
      category: 'Restorative Care',
      shortDescription: 'Tooth-colored durable aesthetic restorations to protect decaying or chipped teeth.',
      fullDescription: 'High-strength shade-matched composite resins seamlessly bond to your natural tooth structure, sealing dental decay while preserving natural tooth aesthetics.',
      durationMinutes: 45,
      feeNotice: 'Pricing determined by number of surfaces restored.',
      isBookableOnline: true,
      isActive: true,
    },
    {
      id: 'srv_rct',
      name: 'Root Canal Treatment (RCT)',
      category: 'Endodontics',
      shortDescription: 'Painless modern root canal therapy to relieve severe tooth pain and preserve your tooth.',
      fullDescription: 'Advanced rotary endodontic treatment cleans and seals infected pulp tissue under precision local anesthesia, preventing extraction and restoring chewing comfort.',
      durationMinutes: 60,
      feeNotice: 'Fee varies by anterior, premolar, or molar anatomy.',
      isBookableOnline: true,
      isActive: true,
    },
    {
      id: 'srv_whitening',
      name: 'Professional Teeth Whitening',
      category: 'Cosmetic Dentistry',
      shortDescription: 'Safe, dentist-supervised enamel brightening for a radiant, confident smile.',
      fullDescription: 'Clinical-grade peroxide brightening systems safely lift deep tea, coffee, and age-related tooth discoloration with minimal sensitivity.',
      durationMinutes: 45,
      feeNotice: 'In-clinic chairside packages communicated upon evaluation.',
      isBookableOnline: true,
      isActive: true,
    },
    {
      id: 'srv_crowns',
      name: 'Dental Crowns & Bridges',
      category: 'Prosthodontics',
      shortDescription: 'Custom ceramic and zirconia crowns to restore structural strength and aesthetics.',
      fullDescription: 'Precision digital impressions and durable biocompatible zirconia or porcelain-fused restorations that recreate original anatomy and bite balance.',
      durationMinutes: 45,
      feeNotice: 'Tiered options according to material (Zirconia, E-Max, PFM).',
      isBookableOnline: true,
      isActive: true,
    },
    {
      id: 'srv_implants',
      name: 'Dental Implants Consultation',
      category: 'Implantology',
      shortDescription: 'Permanent titanium fixture assessment for missing teeth replacement.',
      fullDescription: 'Comprehensive implant planning using 3D bone evaluation, digital surgical planning, and long-term functional stability assessment.',
      durationMinutes: 45,
      feeNotice: 'Detailed surgical and prosthetic estimate provided post-scan.',
      isBookableOnline: true,
      isActive: true,
    },
    {
      id: 'srv_wisdom',
      name: 'Wisdom Tooth & Oral Surgery Consultation',
      category: 'Oral Surgery',
      shortDescription: 'Evaluation for impacted wisdom teeth, persistent pain, and surgical removal.',
      fullDescription: 'Clinical and radiographic assessment of third molar position, nerve proximity, and surgical planning for atraumatic extraction.',
      durationMinutes: 45,
      feeNotice: 'Categorized according to impaction angle and complexity.',
      isBookableOnline: true,
      isActive: true,
    },
    {
      id: 'srv_ortho',
      name: 'Orthodontics & Clear Aligners Evaluation',
      category: 'Orthodontics',
      shortDescription: 'Teeth straightening, bite alignment, and modern invisible aligner planning.',
      fullDescription: 'Digital smile assessment for crowding, gaps, and malocclusion with transparent aligners and modern aesthetic brackets.',
      durationMinutes: 45,
      feeNotice: 'Customized treatment roadmap provided post-scan.',
      isBookableOnline: true,
      isActive: true,
    },
    {
      id: 'srv_kids',
      name: 'Pediatric Dental Care',
      category: 'Pediatric Dentistry',
      shortDescription: 'Gentle, reassuring dental examinations and preventive sealants for children.',
      fullDescription: 'Friendly, anxiety-free dental visits focused on fluoride application, cavity prevention, pit and fissure sealants, and lifelong oral habits.',
      durationMinutes: 30,
      feeNotice: 'Consultation fee discussed at reception.',
      isBookableOnline: true,
      isActive: true,
    },
  ],
  dentists: [
    {
      id: 'doc_01',
      name: 'Dr. Smile Architect (Chief Dental Surgeon)',
      qualifications: 'BDS, MDS (Prosthodontics & Implantology)',
      specializations: ['Cosmetic Dentistry', 'Dental Implants', 'Aesthetic Crowns', 'Smile Designing'],
      experienceYears: 12,
      languages: ['Kannada', 'English', 'Hindi'],
      bio: 'Senior Dental Consultant in Mysuru dedicated to patient-first, painless dentistry and durable aesthetic rehabilitation with advanced digital workflows.',
      photoUrl: '',
      isActive: true,
      workingDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    },
    {
      id: 'doc_02',
      name: 'Dr. Associate Endodontist',
      qualifications: 'BDS, MDS (Conservative Dentistry & Endodontics)',
      specializations: ['Single-Sitting RCT', 'Microscopic Dentistry', 'Aesthetic Fillings', 'Pediatric Care'],
      experienceYears: 8,
      languages: ['Kannada', 'English'],
      bio: 'Specialist endodontist focusing on minimally invasive techniques, comfortable pain relief, and natural tooth preservation.',
      photoUrl: '',
      isActive: true,
      workingDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    },
  ],
  businessHours: [
    { dayOfWeek: 0, isOpen: true, morningOpen: '10:00', morningClose: '13:00' }, // Sunday (Morning only)
    { dayOfWeek: 1, isOpen: true, morningOpen: '10:00', morningClose: '13:30', eveningOpen: '17:00', eveningClose: '20:30' }, // Mon
    { dayOfWeek: 2, isOpen: true, morningOpen: '10:00', morningClose: '13:30', eveningOpen: '17:00', eveningClose: '20:30' }, // Tue
    { dayOfWeek: 3, isOpen: true, morningOpen: '10:00', morningClose: '13:30', eveningOpen: '17:00', eveningClose: '20:30' }, // Wed
    { dayOfWeek: 4, isOpen: true, morningOpen: '10:00', morningClose: '13:30', eveningOpen: '17:00', eveningClose: '20:30' }, // Thu
    { dayOfWeek: 5, isOpen: true, morningOpen: '10:00', morningClose: '13:30', eveningOpen: '17:00', eveningClose: '20:30' }, // Fri
    { dayOfWeek: 6, isOpen: true, morningOpen: '10:00', morningClose: '13:30', eveningOpen: '17:00', eveningClose: '20:30' }, // Sat
  ],
  blockedDates: [],
  appointments: [
    {
      id: 'apt_seed_01',
      bookingReference: 'SMILE-9042-MY',
      patientName: 'Kavitha R.',
      patientPhone: '+91 98451 22340',
      patientEmail: 'kavitha.r@example.com',
      serviceId: 'srv_scaling',
      serviceName: 'Teeth Cleaning & Ultrasonic Scaling',
      serviceDuration: 45,
      dentistId: 'doc_01',
      dentistName: 'Dr. Smile Architect (Chief Dental Surgeon)',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      startTime: '10:30',
      endTime: '11:15',
      status: 'confirmed',
      patientNotes: 'Routine cleaning appointment.',
      verificationToken: crypto.randomBytes(32).toString('hex'),
      tokenExpiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt_seed_02',
      bookingReference: 'SMILE-3185-MY',
      patientName: 'Anand Kumar',
      patientPhone: '+91 94480 55120',
      serviceId: 'srv_gen_consult',
      serviceName: 'General Dental Consultation',
      serviceDuration: 30,
      dentistId: 'doc_02',
      dentistName: 'Dr. Associate Endodontist',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      startTime: '17:30',
      endTime: '18:00',
      status: 'confirmed',
      patientNotes: 'Mild sensitivity on lower molar.',
      verificationToken: crypto.randomBytes(32).toString('hex'),
      tokenExpiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  gallery: [
    {
      id: 'gal_01',
      title: 'Reception & Consultation Lounge',
      category: 'interior',
      imageUrl: '/src/assets/images/clinic_interior_hero_1791650425996.jpg',
      caption: 'Welcoming, hygienic, and calm patient reception at Smile Architect Dental Clinic.',
    },
    {
      id: 'gal_02',
      title: 'Ergonomic Dental Operatory',
      category: 'operatory',
      imageUrl: '/src/assets/images/dental_treatment_room_1791650444673.jpg',
      caption: 'Sterile treatment operatory equipped with cutting-edge patient comfort chairs and surgical lighting.',
    },
    {
      id: 'gal_03',
      title: 'Diagnostic Imaging Suite',
      category: 'equipment',
      imageUrl: '/src/assets/images/dental_diagnostic_suite_1791650458180.jpg',
      caption: 'High-resolution digital radiography and 3D diagnostics for precise treatment planning.',
    },
    {
      id: 'gal_04',
      title: 'Patient Smile Consultation',
      category: 'consultation',
      imageUrl: '/src/assets/images/dental_care_consultation_1791650472918.jpg',
      caption: 'Transparent discussions, visual tooth anatomy explanations, and unhurried patient counsel.',
    },
  ],
  testimonials: [
    {
      id: 'rev_01',
      patientName: 'Naveen Prashanth',
      treatment: 'Root Canal Treatment & Crown',
      comment: 'Very professional and gentle care. The doctor explained every step clearly and the entire root canal procedure was practically painless. Clean clinic in Hebbal.',
      source: 'Google Review',
      date: 'Verified Patient',
      rating: 5,
    },
    {
      id: 'rev_02',
      patientName: 'Pooja Venkatesh',
      treatment: 'Teeth Cleaning & Scaling',
      comment: 'Went for teeth cleaning and consultation. The clinic is spotless, staff are courteous, and there was no waiting time when booked in advance. Highly recommended in Mysuru!',
      source: 'Google Review',
      date: 'Verified Patient',
      rating: 5,
    },
    {
      id: 'rev_03',
      patientName: 'Manjunath S.',
      treatment: 'Dental Consultation & Fillings',
      comment: 'Honest advice and transparent treatment options. Did not push unnecessary procedures. Very satisfied with the filling work.',
      source: 'Google Review',
      date: 'Verified Patient',
      rating: 5,
    },
  ],
  faqs: [
    {
      id: 'faq_01',
      category: 'Appointments',
      question: 'How do I book an appointment online at Smile Architect Dental Clinic?',
      answer: 'Choose your desired service, select your preferred dentist (or any available dentist), pick a suitable date and available time slot, enter your basic contact details, and submit. You will receive an immediate booking reference number.',
    },
    {
      id: 'faq_02',
      category: 'Appointments',
      question: 'Can I reschedule or cancel my booking if my plans change?',
      answer: 'Yes. You can manage your appointment online anytime using your booking reference and mobile number, or contact us directly via phone (+91 90368 27916) or WhatsApp.',
    },
    {
      id: 'faq_03',
      category: 'Timings',
      question: 'What are the clinic opening hours in Hebbal 2nd Stage, Mysuru?',
      answer: 'Monday to Saturday: Morning session 10:00 AM – 1:30 PM, Evening session 5:00 PM – 8:30 PM. Sunday: Morning session 10:00 AM – 1:00 PM (by prior appointment).',
    },
    {
      id: 'faq_04',
      category: 'Fees',
      question: 'How are treatment fees and consultation charges communicated?',
      answer: 'We maintain strict transparency. Consultation fees and personalized treatment plans are explained clearly after a direct clinical examination, with zero surprise charges or unverified quotes.',
    },
    {
      id: 'faq_05',
      category: 'Location',
      question: 'Where is the clinic located and is parking available?',
      answer: 'We are located at 850/S, 25th Cross Road, Manchegowdana Koppalu, Sankranthi Circle, Hebbal 2nd Stage, Mysuru (Landmark: near Sankranthi Circle). Street parking for two-wheelers and four-wheelers is readily accessible.',
    },
    {
      id: 'faq_06',
      category: 'Safety',
      question: 'What hygiene and sterilization protocols are followed?',
      answer: 'We adhere to multi-stage autoclave sterilization, medical-grade ultrasonic cleaners, individually packaged sterile instrument pouches opened in front of the patient, and hospital-grade surface disinfection between visits.',
    },
  ],
  auditLogs: [
    {
      id: 'log_seed_01',
      timestamp: new Date().toISOString(),
      actorEmail: 'system',
      actorRole: 'system',
      action: 'SYSTEM_INITIALIZED',
      details: 'Smile Architect Dental Clinic database initialized with verified clinic schema.',
    },
  ],
};

class Database {
  private data: DatabaseSchema;
  private isSaving = false;
  private lockQueue: (() => void)[] = [];

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Error loading database file, falling back to initial data:', err);
    }

    // Save initial data
    this.persist(initialData);
    return initialData;
  }

  private persist(state: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Failed to persist data to disk:', err);
    }
  }

  // Mutex lock for atomic operations (e.g. appointment booking)
  public async withLock<T>(fn: () => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const execute = async () => {
        try {
          const result = await fn();
          this.persist(this.data);
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          const next = this.lockQueue.shift();
          if (next) next();
          else this.isSaving = false;
        }
      };

      if (this.isSaving) {
        this.lockQueue.push(execute);
      } else {
        this.isSaving = true;
        execute();
      }
    });
  }

  // Getters
  public getSettings(): ClinicSettings {
    return { ...this.data.settings };
  }

  public updateSettings(newSettings: Partial<ClinicSettings>, actor: { email: string; role: string }) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.addAuditLog(actor.email, actor.role, 'UPDATE_SETTINGS', 'Clinic settings updated');
    this.persist(this.data);
    return this.data.settings;
  }

  public getProfiles() {
    return this.data.profiles.map(({ passwordHash, ...p }) => p);
  }

  public findProfileByEmail(email: string) {
    return this.data.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  public getServices(activeOnly = true): Service[] {
    if (activeOnly) {
      return this.data.services.filter((s) => s.isActive);
    }
    return [...this.data.services];
  }

  public getServiceById(id: string): Service | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  public getDentists(activeOnly = true): Dentist[] {
    if (activeOnly) {
      return this.data.dentists.filter((d) => d.isActive);
    }
    return [...this.data.dentists];
  }

  public getDentistById(id: string): Dentist | undefined {
    return this.data.dentists.find((d) => d.id === id);
  }

  public getBusinessHours(): BusinessHours[] {
    return [...this.data.businessHours];
  }

  public updateBusinessHours(hours: BusinessHours[], actor: { email: string; role: string }) {
    this.data.businessHours = hours;
    this.addAuditLog(actor.email, actor.role, 'UPDATE_HOURS', 'Business hours updated');
    this.persist(this.data);
    return this.data.businessHours;
  }

  public getBlockedDates(): BlockedDate[] {
    return [...this.data.blockedDates];
  }

  public addBlockedDate(blocked: Omit<BlockedDate, 'id'>, actor: { email: string; role: string }): BlockedDate {
    const newEntry: BlockedDate = {
      id: `blk_${Date.now()}`,
      ...blocked,
    };
    this.data.blockedDates.push(newEntry);
    this.addAuditLog(actor.email, actor.role, 'ADD_BLOCKED_DATE', `Blocked date ${blocked.date}: ${blocked.reason}`);
    this.persist(this.data);
    return newEntry;
  }

  public removeBlockedDate(id: string, actor: { email: string; role: string }): boolean {
    const idx = this.data.blockedDates.findIndex((b) => b.id === id);
    if (idx !== -1) {
      const removed = this.data.blockedDates.splice(idx, 1)[0];
      this.addAuditLog(actor.email, actor.role, 'REMOVE_BLOCKED_DATE', `Removed blocked date ${removed.date}`);
      this.persist(this.data);
      return true;
    }
    return false;
  }

  public getAppointments(): Appointment[] {
    return [...this.data.appointments];
  }

  public getAppointmentById(id: string): Appointment | undefined {
    return this.data.appointments.find((a) => a.id === id);
  }

  public getAppointmentByReference(reference: string, phone?: string): Appointment | undefined {
    return this.data.appointments.find((a) => {
      const matchRef = a.bookingReference.toUpperCase() === reference.trim().toUpperCase();
      if (!matchRef) return false;
      if (phone) {
        // Normalize phones for comparison
        const normReq = phone.replace(/\D/g, '').slice(-10);
        const normApt = a.patientPhone.replace(/\D/g, '').slice(-10);
        return normReq === normApt;
      }
      return true;
    });
  }

  public createAppointment(apt: Appointment): Appointment {
    this.data.appointments.push(apt);
    this.addAuditLog(
      'system',
      'booking_engine',
      'CREATE_APPOINTMENT',
      `Booking ${apt.bookingReference} for ${apt.patientName} on ${apt.date} at ${apt.startTime}`
    );
    this.persist(this.data);
    return apt;
  }

  public updateAppointment(id: string, updates: Partial<Appointment>, actor: { email: string; role: string }): Appointment | null {
    const apt = this.data.appointments.find((a) => a.id === id);
    if (!apt) return null;

    Object.assign(apt, updates, { updatedAt: new Date().toISOString() });
    this.addAuditLog(
      actor.email,
      actor.role,
      'UPDATE_APPOINTMENT',
      `Updated appointment ${apt.bookingReference}: ${JSON.stringify(updates)}`
    );
    this.persist(this.data);
    return apt;
  }

  public getGallery(): GalleryItem[] {
    return [...this.data.gallery];
  }

  public getTestimonials(): Testimonial[] {
    return [...this.data.testimonials];
  }

  public getFaqs(): FAQItem[] {
    return [...this.data.faqs];
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  public addAuditLog(actorEmail: string, actorRole: string, action: string, details: string) {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      actorEmail,
      actorRole,
      action,
      details,
    };
    this.data.auditLogs.push(log);
    // Keep max 500 audit logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(-500);
    }
  }
}

export const db = new Database();
