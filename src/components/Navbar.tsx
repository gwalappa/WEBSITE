import React, { useState } from 'react';
import { Phone, Calendar, Lock, Menu, X, MessageSquare } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenLookup,
  onOpenAdmin,
  isLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Brand Wordmark (Strict Top Bar Contract: clean single line text element) */}
          <a href="#" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#0B6B68] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 5.5 2 8 .5 2.5 1 4 2 4s2-2 2-4c0-2 .5-4 2-4s2 2 2 4c0 2 1 4 2 4s1.5-1.5 2-4c.5-2.5 2-5 2-8 0-3.5-2.5-6-6-6z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#172B3A] block">
                Smile Architect
              </span>
              <span className="text-xs font-medium text-slate-500 block">
                Dental Clinic · Mysuru
              </span>
            </div>
          </a>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-[#0B6B68] transition-colors whitespace-nowrap shrink-0">
              About Us
            </a>
            <a href="#treatments" className="hover:text-[#0B6B68] transition-colors whitespace-nowrap shrink-0">
              Treatments
            </a>
            <a href="#doctors" className="hover:text-[#0B6B68] transition-colors whitespace-nowrap shrink-0">
              Our Doctors
            </a>
            <a href="#gallery" className="hover:text-[#0B6B68] transition-colors whitespace-nowrap shrink-0">
              Clinic Tour
            </a>
            <a href="#reviews" className="hover:text-[#0B6B68] transition-colors whitespace-nowrap shrink-0">
              Reviews & FAQs
            </a>
            <a href="#contact" className="hover:text-[#0B6B68] transition-colors whitespace-nowrap shrink-0">
              Contact
            </a>
            <button
              onClick={onOpenLookup}
              className="text-slate-500 hover:text-[#0B6B68] transition-colors whitespace-nowrap shrink-0 text-xs font-semibold uppercase tracking-wider"
            >
              My Booking
            </button>
          </nav>

          {/* Zone 3: Primary Action & Quick Contact */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <a
              href="tel:+919036827916"
              className="hidden xl:flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-[#0B6B68] transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-[#0B6B68]" />
              <span>+91 90368 27916</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0B6B68] rounded-xl hover:bg-[#085552] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={onOpenAdmin}
              title={isLoggedIn ? 'Clinic Staff Portal (Logged In)' : 'Clinic Staff Login'}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Lock className={`w-4 h-4 ${isLoggedIn ? 'text-[#0B6B68]' : ''}`} />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B6B68] rounded-lg"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0B6B68]"
            >
              About Us
            </a>
            <a
              href="#treatments"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0B6B68]"
            >
              Treatments & Services
            </a>
            <a
              href="#doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0B6B68]"
            >
              Our Doctors
            </a>
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0B6B68]"
            >
              Clinic Gallery
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0B6B68]"
            >
              Patient Reviews & FAQs
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0B6B68]"
            >
              Location & Contact
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLookup();
              }}
              className="text-left py-1 text-[#0B6B68] font-semibold"
            >
              Look Up Existing Booking
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href="tel:+919036827916"
              className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <Phone className="w-4 h-4 text-[#0B6B68]" />
              Call Clinic: +91 90368 27916
            </a>
            <a
              href="https://wa.me/919036827916?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20dental%20treatments%20at%20Smile%20Architect"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold"
            >
              <MessageSquare className="w-4 h-4" />
              Chat on WhatsApp
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="text-xs text-slate-500 py-1 text-center"
            >
              Clinic Staff Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
