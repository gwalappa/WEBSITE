import React from 'react';
import { Calendar, ArrowRight, Star, ShieldCheck, MapPin, Clock } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
  onExploreTreatments: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExploreTreatments }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F8F8] to-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Quiet Trust Kicker (Strict Anti-Slop: No pills, clean typographic kicker) */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B6B68]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Hebbal 2nd Stage · Mysuru</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Near Sankranthi Circle</span>
            </div>

            {/* marqee headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#172B3A] leading-[1.12] text-balance">
              Your Smile Deserves Expert Care.
            </h1>

            {/* supporting copy */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-xl">
              Thoughtful dental care, modern treatment options, and a comfortable experience for every smile.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenBooking}
                className="px-7 py-3.5 bg-[#0B6B68] text-white text-sm font-semibold rounded-xl hover:bg-[#085552] transition-colors shadow-sm flex items-center justify-center gap-2.5 group"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Your Appointment</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={onExploreTreatments}
                className="px-6 py-3.5 bg-white text-slate-700 hover:text-[#0B6B68] text-sm font-semibold rounded-xl border border-slate-200 hover:border-[#0B6B68]/30 transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Treatments</span>
              </button>
            </div>

            {/* Verified Trust Strip */}
            <div className="pt-6 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm text-slate-900 tabular-nums">4.8 / 5.0</span>
                </div>
                <p className="text-xs text-slate-500">
                  Google Maps listing · 150 reviews
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[#0B6B68] mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-900">Hospital Grade</span>
                </div>
                <p className="text-xs text-slate-500">
                  Autoclave sterile protocols
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-[#0B6B68] mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-900">Zero Wait Time</span>
                </div>
                <p className="text-xs text-slate-500">
                  Scheduled time slots respected
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Authentic Clinic Photo */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 aspect-[16/10] bg-slate-100">
              <img
                src="/src/assets/images/clinic_interior_hero_1791650425996.jpg"
                alt="Smile Architect Dental Clinic Reception & Consultation Lounge, Mysuru"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Bottom image caption */}
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs flex items-center justify-between">
                <span className="font-medium bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  Smile Architect Dental Clinic Lounge · Hebbal 2nd Stage
                </span>
                <span className="hidden sm:inline-block text-white/80">
                  Hygienic & Anxiety-Free Environment
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
