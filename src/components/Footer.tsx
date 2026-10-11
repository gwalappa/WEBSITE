import React from 'react';
import { Phone, MapPin, MessageSquare, Lock, Heart } from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenLookup,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0B6B68] text-white flex items-center justify-center font-bold">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 5.5 2 8 .5 2.5 1 4 2 4s2-2 2-4c0-2 .5-4 2-4s2 2 2 4c0 2 1 4 2 4s1.5-1.5 2-4c.5-2.5 2-5 2-8 0-3.5-2.5-6-6-6z" />
                </svg>
              </div>
              <span className="text-base font-bold text-[#172B3A]">
                Smile Architect
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dental Clinic · Mysuru. Expert dental care, restorative aesthetics, and comforting patient-first oral health solutions.
            </p>
            <p className="text-[11px] text-slate-400">
              Karnataka Dental Council verified clinicians.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-[#172B3A] uppercase tracking-wider mb-3">
              Patient Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#treatments" className="hover:text-[#0B6B68] transition-colors">
                  Treatments Directory
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#0B6B68] transition-colors">
                  Hygiene & Sterilization
                </a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-[#0B6B68] transition-colors">
                  Doctor Profiles
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-[#0B6B68] transition-colors text-left"
                >
                  Book Online Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLookup}
                  className="text-[#0B6B68] font-semibold hover:underline text-left"
                >
                  Manage / Cancel Booking
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Timings & Location */}
          <div>
            <h4 className="text-xs font-bold text-[#172B3A] uppercase tracking-wider mb-3">
              Clinic Address
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              850/S, 25th Cross Road, Manchegowdana Koppalu, Sankranthi Circle, Hebbal 2nd Stage, Mysuru, Karnataka 570017
            </p>
            <div className="space-y-1 text-[11px] text-slate-500">
              <p>Mon - Sat: 10:00 AM – 1:30 PM & 5:00 PM – 8:30 PM</p>
              <p>Sun: 10:00 AM – 1:00 PM (By Appointment)</p>
            </div>
          </div>

          {/* Col 4: Contact & Staff */}
          <div>
            <h4 className="text-xs font-bold text-[#172B3A] uppercase tracking-wider mb-3">
              Contact Desk
            </h4>
            <div className="space-y-2">
              <a
                href="tel:+919036827916"
                className="flex items-center gap-2 hover:text-[#0B6B68] transition-colors text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-[#0B6B68]" />
                <span>+91 90368 27916</span>
              </a>
              <a
                href="https://wa.me/919036827916"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-700 transition-colors text-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp: 90368 27916</span>
              </a>
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors text-xs font-medium"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Clinic Staff Portal</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} Smile Architect Dental Clinic. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Medical disclaimer: Online booking reserves clinical chair time and does not constitute medical diagnosis.
          </p>
        </div>
      </div>
    </footer>
  );
};
