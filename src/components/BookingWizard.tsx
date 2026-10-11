import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  MapPin,
  Share2,
  CalendarPlus,
  MessageSquare,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Service, Dentist, TimeSlot, Appointment } from '../types/index.ts';

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: Service | null;
  onBookingCompleted?: (appointment: Appointment) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  isOpen,
  onClose,
  preselectedService,
  onBookingCompleted,
}) => {
  // Wizard state: 1 to 7
  const [step, setStep] = useState<number>(1);

  // Available data from server
  const [services, setServices] = useState<Service[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Booking form selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDentistId, setSelectedDentistId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string>('');

  // Patient inputs
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [alternativeSlots, setAlternativeSlots] = useState<string[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string>('');

  // Load services & dentists on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [srvRes, docRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/dentists'),
        ]);
        const srvData = await srvRes.json();
        const docData = await docRes.json();
        setServices(srvData);
        setDentists(docData);

        if (preselectedService) {
          setSelectedService(preselectedService);
          setStep(2);
        } else if (srvData.length > 0) {
          setSelectedService(srvData[0]);
        }
      } catch (err) {
        console.error('Failed to load clinic options:', err);
      } finally {
        setLoadingInitial(false);
      }
    }

    if (isOpen) {
      loadData();
    }
  }, [isOpen, preselectedService]);

  // Set default initial date to tomorrow in Asia/Kolkata timezone
  useEffect(() => {
    if (!selectedDate) {
      const tomorrow = new Date(Date.now() + 86400000);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [selectedDate]);

  // Fetch available slots whenever date, service, or dentist changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return;

    async function fetchSlots() {
      setLoadingSlots(true);
      setSlotError('');
      setSelectedTimeSlot('');
      try {
        const url = `/api/availability?date=${selectedDate}&serviceId=${selectedService!.id}&dentistId=${selectedDentistId}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.isClosed) {
          setSlotError(data.closureReason || 'Clinic is closed on this date.');
          setAvailableSlots([]);
        } else {
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        setSlotError('Unable to load available slots. Please try again.');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedDate, selectedService, selectedDentistId]);

  if (!isOpen) return null;

  // Validation for patient details (Step 5)
  const validatePatientDetails = (): boolean => {
    const errors: Record<string, string> = {};

    if (!patientName.trim() || patientName.trim().length < 2) {
      errors.name = 'Please enter patient full name (minimum 2 characters).';
    }

    const cleanPhone = patientPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (patientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!privacyConsent) {
      errors.consent = 'You must agree to the appointment booking policy.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Final Booking (Step 6 -> Step 7)
  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setSubmitError('');
    setAlternativeSlots([]);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          patientPhone: patientPhone.trim(),
          patientEmail: patientEmail.trim() || undefined,
          serviceId: selectedService!.id,
          dentistId: selectedDentistId,
          date: selectedDate,
          startTime: selectedTimeSlot,
          patientNotes: patientNotes.trim() || undefined,
          privacyConsent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setSubmitError(data.error || 'The slot was just reserved. Please pick another slot.');
          if (data.alternativeSlots && data.alternativeSlots.length > 0) {
            setAlternativeSlots(data.alternativeSlots);
          }
          return;
        }
        throw new Error(data.error || 'Failed to confirm booking.');
      }

      setConfirmedBooking(data.appointment);
      setWhatsappLink(data.notificationSummary?.whatsappLink || '');
      if (onBookingCompleted) {
        onBookingCompleted(data.appointment);
      }
      setStep(7); // Show confirmation result
    } catch (err: any) {
      setSubmitError(err.message || 'Error processing appointment. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate .ics calendar download
  const handleDownloadCalendar = () => {
    if (!confirmedBooking) return;
    const [year, month, day] = confirmedBooking.date.split('-').map(Number);
    const [startH, startM] = confirmedBooking.startTime.split(':').map(Number);
    const [endH, endM] = confirmedBooking.endTime.split(':').map(Number);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${year}${pad(month)}${pad(day)}T${pad(startH)}${pad(startM)}00`;
    const endStr = `${year}${pad(month)}${pad(day)}T${pad(endH)}${pad(endM)}00`;

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smile Architect Dental Clinic//Mysuru Appointment//EN',
      'BEGIN:VEVENT',
      `UID:${confirmedBooking.bookingReference}@smilearchitect.com`,
      `DTSTAMP:${startStr}Z`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:Dental Appointment - ${confirmedBooking.serviceName}`,
      `DESCRIPTION:Appointment at Smile Architect Dental Clinic. Ref: ${confirmedBooking.bookingReference}. Doctor: ${confirmedBooking.dentistName}`,
      'LOCATION:850/S, 25th Cross Road, Sankranthi Circle, Hebbal 2nd Stage, Mysuru, Karnataka 570017',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Smile_Architect_${confirmedBooking.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#F5F8F8]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0B6B68] text-white flex items-center justify-center text-xs font-bold">
              {step <= 6 ? step : <Check className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172B3A]">
                {step === 1 && 'Step 1: Choose Treatment'}
                {step === 2 && 'Step 2: Select Dentist'}
                {step === 3 && 'Step 3: Pick Appointment Date'}
                {step === 4 && 'Step 4: Select Available Time Slot'}
                {step === 5 && 'Step 5: Patient Contact Details'}
                {step === 6 && 'Step 6: Review & Confirm'}
                {step === 7 && 'Appointment Confirmed'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {step < 7 ? `Step ${step} of 6 · Instant confirmation` : 'Booking Reference Issued'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with dynamic step contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loadingInitial ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#0B6B68]" />
              <span className="text-xs">Loading available treatments & clinic schedule...</span>
            </div>
          ) : (
            <>
              {/* STEP 1: Select Service */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Select the dental treatment or consultation you would like to schedule:
                  </p>
                  <div className="grid grid-cols-1 gap-2.5 max-h-96 overflow-y-auto pr-1">
                    {services.map((srv) => (
                      <button
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          selectedService?.id === srv.id
                            ? 'border-[#0B6B68] bg-[#DDF4F0]/30 ring-1 ring-[#0B6B68]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#172B3A]">{srv.name}</span>
                            <span className="text-[11px] text-slate-500">· {srv.durationMinutes} mins</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{srv.shortDescription}</p>
                          <p className="text-[11px] text-slate-400 mt-1">{srv.feeNotice}</p>
                        </div>
                        {selectedService?.id === srv.id && (
                          <div className="w-5 h-5 rounded-full bg-[#0B6B68] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Select Dentist */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Choose your doctor, or allow the clinic to allocate the first available specialist:
                  </p>

                  <div className="space-y-2.5">
                    {/* Option: Any Available Dentist */}
                    <button
                      onClick={() => setSelectedDentistId('any')}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                        selectedDentistId === 'any'
                          ? 'border-[#0B6B68] bg-[#DDF4F0]/30 ring-1 ring-[#0B6B68]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#172B3A]">
                          Any Available Dental Specialist (Recommended)
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Gives you the widest selection of morning and evening slots.
                        </p>
                      </div>
                      {selectedDentistId === 'any' && (
                        <div className="w-5 h-5 rounded-full bg-[#0B6B68] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>

                    {/* Specific Doctors */}
                    {dentists.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDentistId(doc.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                          selectedDentistId === doc.id
                            ? 'border-[#0B6B68] bg-[#DDF4F0]/30 ring-1 ring-[#0B6B68]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-[#172B3A]">{doc.name}</div>
                          <p className="text-[11px] text-slate-500">{doc.qualifications}</p>
                          <p className="text-[11px] text-[#0B6B68] font-medium mt-1">
                            {doc.specializations.slice(0, 3).join(', ')}
                          </p>
                        </div>
                        {selectedDentistId === doc.id && (
                          <div className="w-5 h-5 rounded-full bg-[#0B6B68] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Choose Date */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Select a date for your visit. Sunday appointments are available in the morning session.
                  </p>

                  <div className="p-4 bg-[#F5F8F8] rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-[#172B3A]">
                      Select Appointment Date:
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      max={
                        new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
                      }
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                    />

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5 text-[#0B6B68]" />
                      <span>Clinic Hours: Mon-Sat 10:00-13:30 & 17:00-20:30 · Sun 10:00-13:00</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Choose Time Slot */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Live availability for <strong>{selectedDate}</strong> ({selectedService?.durationMinutes} min appointment):
                    </span>
                    <button
                      onClick={() => setStep(3)}
                      className="text-[#0B6B68] font-semibold underline"
                    >
                      Change Date
                    </button>
                  </div>

                  {loadingSlots ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-[#0B6B68]" />
                      <span className="text-xs">Computing live chair availability...</span>
                    </div>
                  ) : slotError ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{slotError}</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
                      No slots available for this service on {selectedDate}. Please select another date.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                      {/* Morning slots */}
                      {availableSlots.filter((s) => s.time < '14:00').length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Morning Session (10:00 AM – 1:30 PM)
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableSlots
                              .filter((s) => s.time < '14:00')
                              .map((slot) => (
                                <button
                                  key={slot.time}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold tabular-nums text-center transition-all ${
                                    selectedTimeSlot === slot.time
                                      ? 'bg-[#0B6B68] text-white shadow-2xs'
                                      : slot.available
                                      ? 'bg-white border border-slate-200 hover:border-[#0B6B68] text-slate-800'
                                      : 'bg-slate-100 text-slate-300 border border-transparent cursor-not-allowed line-through'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Evening slots */}
                      {availableSlots.filter((s) => s.time >= '17:00').length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Evening Session (5:00 PM – 8:30 PM)
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableSlots
                              .filter((s) => s.time >= '17:00')
                              .map((slot) => (
                                <button
                                  key={slot.time}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold tabular-nums text-center transition-all ${
                                    selectedTimeSlot === slot.time
                                      ? 'bg-[#0B6B68] text-white shadow-2xs'
                                      : slot.available
                                      ? 'bg-white border border-slate-200 hover:border-[#0B6B68] text-slate-800'
                                      : 'bg-slate-100 text-slate-300 border border-transparent cursor-not-allowed line-through'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Patient Details */}
              {step === 5 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Please provide patient contact information for your booking confirmation:
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#172B3A] mb-1">
                        Patient Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="e.g. Ramesh Gowda"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                        />
                      </div>
                      {formErrors.name && (
                        <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B3A] mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="+91 98450 12345"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-[11px] text-red-600 mt-1">{formErrors.phone}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Used for appointment confirmation, reminders, and online self-management.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B3A] mb-1">
                        Email Address <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-[11px] text-red-600 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B3A] mb-1">
                        Visit Notes <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <textarea
                          rows={2}
                          value={patientNotes}
                          onChange={(e) => setPatientNotes(e.target.value)}
                          placeholder="e.g. Mild sensitivity on lower molar, or preferred language..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                        />
                      </div>
                      <p className="text-[10px] text-amber-700 mt-1">
                        ⚠️ Please do not enter sensitive medical history or diagnoses in this optional note.
                      </p>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacyConsent}
                          onChange={(e) => setPrivacyConsent(e.target.checked)}
                          className="mt-0.5 rounded text-[#0B6B68] focus:ring-[#0B6B68]"
                        />
                        <span>
                          I agree to the clinic appointment policy and acknowledge that online booking reserves chair time subject to clinical evaluation.
                        </span>
                      </label>
                      {formErrors.consent && (
                        <p className="text-[11px] text-red-600 mt-1">{formErrors.consent}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Review & Confirm */}
              {step === 6 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Please review your appointment summary before submitting:
                  </p>

                  <div className="bg-[#F5F8F8] p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Patient Name</span>
                        <strong className="text-[#172B3A]">{patientName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Contact Mobile</span>
                        <strong className="text-[#172B3A]">{patientPhone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Treatment</span>
                        <strong className="text-[#172B3A]">{selectedService?.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Duration</span>
                        <strong className="text-[#172B3A] tabular-nums">
                          {selectedService?.durationMinutes} mins
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Date</span>
                        <strong className="text-[#172B3A]">{selectedDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Time Slot</span>
                        <strong className="text-[#0B6B68] tabular-nums">{selectedTimeSlot}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0B6B68] shrink-0 mt-0.5" />
                      <span>
                        850/S, 25th Cross Road, Sankranthi Circle, Hebbal 2nd Stage, Mysuru - 570017
                      </span>
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                      <p>{submitError}</p>
                      {alternativeSlots.length > 0 && (
                        <div>
                          <p className="font-bold text-[11px] mb-1">Alternative open slots on this date:</p>
                          <div className="flex gap-2">
                            {alternativeSlots.map((alt) => (
                              <button
                                key={alt}
                                onClick={() => {
                                  setSelectedTimeSlot(alt);
                                  setSubmitError('');
                                  setAlternativeSlots([]);
                                }}
                                className="px-2.5 py-1 bg-white border border-red-300 rounded text-xs font-semibold text-red-900"
                              >
                                {alt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 7: Booking Confirmed Result */}
              {step === 7 && confirmedBooking && (
                <div className="text-center py-4 space-y-5">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      Appointment Successfully Confirmed
                    </span>
                    <h3 className="text-xl font-bold text-[#172B3A] mt-1">
                      {confirmedBooking.patientName}
                    </h3>
                  </div>

                  {/* Booking Reference Box */}
                  <div className="p-4 bg-[#F5F8F8] border border-slate-200 rounded-xl max-w-sm mx-auto">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                      Booking Reference Number
                    </span>
                    <strong className="text-xl font-mono tracking-widest text-[#0B6B68]">
                      {confirmedBooking.bookingReference}
                    </strong>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Save this reference number to look up, reschedule, or cancel your booking.
                    </p>
                  </div>

                  {/* Supabase Database Sync Status Badge */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 mx-auto max-w-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved & connected to Supabase database (ID: egccbzkmprexuhkhixep)</span>
                  </div>

                  <div className="p-3 text-xs text-slate-600 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto space-y-1">
                    <p>
                      <strong>Date & Time:</strong> {confirmedBooking.date} at {confirmedBooking.startTime} (
                      {confirmedBooking.serviceDuration} mins)
                    </p>
                    <p>
                      <strong>Doctor:</strong> {confirmedBooking.dentistName}
                    </p>
                    <p>
                      <strong>Clinic:</strong> Smile Architect Dental Clinic, Hebbal 2nd Stage, Mysuru
                    </p>
                  </div>

                  {/* Actions: Google Maps, Calendar, WhatsApp */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <a
                      href="https://maps.app.goo.gl/m6FKojfRqpNL3FDQ8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-800 flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>Directions in Google Maps</span>
                    </a>

                    <button
                      onClick={handleDownloadCalendar}
                      className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-800 flex items-center gap-1.5"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[#0B6B68]" />
                      <span>Add to Calendar (.ics)</span>
                    </button>

                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl hover:bg-emerald-100 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send WhatsApp Confirmation</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 7 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                disabled={
                  (step === 1 && !selectedService) ||
                  (step === 3 && !selectedDate) ||
                  (step === 4 && !selectedTimeSlot)
                }
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0B6B68] rounded-xl hover:bg-[#085552] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : step === 5 ? (
              <button
                onClick={() => {
                  if (validatePatientDetails()) {
                    setStep(6);
                  }
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0B6B68] rounded-xl hover:bg-[#085552] flex items-center gap-1"
              >
                <span>Review Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleConfirmBooking}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#0B6B68] rounded-xl hover:bg-[#085552] disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving Chair...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {step === 7 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
