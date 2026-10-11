import React, { useState } from 'react';
import {
  X,
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarPlus,
  Loader2,
} from 'lucide-react';
import { Appointment } from '../types/index.ts';

interface BookingLookupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewBooking?: () => void;
}

export const BookingLookup: React.FC<BookingLookupProps> = ({
  isOpen,
  onClose,
  onOpenNewBooking,
}) => {
  const [reference, setReference] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  // Cancellation state
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelSuccess, setCancelSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !phone.trim()) {
      setError('Please enter both booking reference and registered mobile number.');
      return;
    }

    setLoading(true);
    setError('');
    setAppointment(null);
    setCancelSuccess(false);

    try {
      const res = await fetch('/api/appointments/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: reference.trim(), phone: phone.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Appointment not found.');
      }
      setAppointment(data.appointment);
    } catch (err: any) {
      setError(err.message || 'Error looking up appointment. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!appointment) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: appointment.bookingReference,
          phone: appointment.patientPhone,
          reason: cancelReason.trim() || 'Cancelled via patient portal',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel appointment.');
      }
      setAppointment(data.appointment);
      setCancelSuccess(true);
      setCancelling(false);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#F5F8F8]">
          <div>
            <h3 className="text-sm font-bold text-[#172B3A]">Look Up Existing Appointment</h3>
            <p className="text-[11px] text-slate-500">
              Check status, reschedule, or cancel your booking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!appointment ? (
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172B3A] mb-1">
                  Booking Reference Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SMILE-9042-MY"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B3A] mb-1">
                  Registered Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9845122340"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Required to verify appointment ownership securely.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#0B6B68] rounded-xl hover:bg-[#085552] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Find My Appointment</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-mono block">
                    Reference: {appointment.bookingReference}
                  </span>
                  <h4 className="text-base font-bold text-[#172B3A]">{appointment.patientName}</h4>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                    appointment.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : appointment.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : appointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#F5F8F8] p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[11px] block">Service</span>
                  <span className="font-semibold text-slate-800">{appointment.serviceName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Dentist</span>
                  <span className="font-semibold text-slate-800">{appointment.dentistName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Date</span>
                  <span className="font-semibold text-slate-800">{appointment.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Time</span>
                  <span className="font-semibold text-[#0B6B68] tabular-nums">
                    {appointment.startTime} - {appointment.endTime}
                  </span>
                </div>
              </div>

              {cancelSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Appointment successfully cancelled. The chair slot has been released.</span>
                </div>
              )}

              {/* Cancellation form */}
              {cancelling ? (
                <div className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl space-y-3">
                  <p className="text-xs font-semibold text-red-900">
                    Are you sure you want to cancel this appointment?
                  </p>
                  <input
                    type="text"
                    placeholder="Reason for cancellation (optional)"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-red-200 rounded-lg focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelBooking}
                      disabled={loading}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                    >
                      Confirm Cancellation
                    </button>
                    <button
                      onClick={() => setCancelling(false)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : appointment.status === 'confirmed' ? (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setCancelling(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 flex-1 text-center"
                  >
                    Cancel Appointment
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenNewBooking) onOpenNewBooking();
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-[#0B6B68] bg-[#DDF4F0] rounded-xl hover:bg-[#c9eee7] flex-1 text-center"
                  >
                    Reschedule
                  </button>
                </div>
              ) : null}

              <button
                onClick={() => setAppointment(null)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 underline pt-2"
              >
                Look up another reference
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
