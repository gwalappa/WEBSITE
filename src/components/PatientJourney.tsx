import React from 'react';
import { Stethoscope, CalendarCheck, UserCheck, ShieldCheck } from 'lucide-react';

interface PatientJourneyProps {
  onStartBooking: () => void;
}

export const PatientJourney: React.FC<PatientJourneyProps> = ({ onStartBooking }) => {
  const steps = [
    {
      step: '01',
      title: 'Choose Treatment',
      description: 'Explore comprehensive dental services—from routine checkups and scaling to root canal treatments and smile enhancement.',
      icon: Stethoscope,
    },
    {
      step: '02',
      title: 'Select Live Slot',
      description: 'View real-time doctor availability across morning and evening sessions. Pick a date and time that fits your day.',
      icon: CalendarCheck,
    },
    {
      step: '03',
      title: 'Quick Contact Details',
      description: 'Provide basic patient information securely. No credit card or unnecessary medical records required upfront.',
      icon: UserCheck,
    },
    {
      step: '04',
      title: 'Instant Confirmation',
      description: 'Receive your unique booking reference number, Google Maps navigation link, and calendar invite immediately.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0B6B68] mb-2">
            Seamless Patient Experience
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172B3A]">
            How Online Appointment Booking Works
          </h2>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            Reserve your dental chair at Smile Architect in under 60 seconds with live slot availability and zero double-booking.
          </p>
        </div>

        {/* 4-Step Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-[#F5F8F8] border border-slate-200/60 transition-all hover:border-[#0B6B68]/40 hover:bg-[#F0F5F5] group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#0B6B68] transition-colors tabular-nums">
                    Step {item.step}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#0B6B68] shadow-2xs group-hover:bg-[#0B6B68] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#172B3A] mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quiet Kicker CTA */}
        <div className="mt-8 flex items-center justify-between p-4 rounded-xl bg-[#DDF4F0]/40 border border-[#0B6B68]/15 text-xs text-slate-700">
          <span>Need help or have an urgent dental emergency in Mysuru?</span>
          <div className="flex items-center gap-3">
            <a
              href="tel:+919036827916"
              className="font-bold text-[#0B6B68] hover:underline"
            >
              Call +91 90368 27916
            </a>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={onStartBooking}
              className="font-bold text-[#0B6B68] hover:underline"
            >
              Book Online Now &rarr;
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
