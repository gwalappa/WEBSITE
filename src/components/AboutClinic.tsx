import React from 'react';
import { Shield, Sparkles, HeartHandshake, Eye, Award } from 'lucide-react';

export const AboutClinic: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0B6B68] mb-2">
            The Smile Architect Philosophy
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172B3A] leading-tight">
            Advanced Clinical Precision, Warm Reassurance.
          </h2>
          <p className="text-slate-600 text-base mt-3 leading-relaxed">
            Founded with a commitment to evidence-based dental care in Mysuru, Smile Architect Dental Clinic pairs state-of-the-art diagnostic instruments with genuine, unhurried patient empathy.
          </p>
        </div>

        {/* 2-Column Story & Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Visual Showcase (3-image arrangement) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-md aspect-[4/3] bg-slate-100 border border-slate-200">
              <img
                src="/src/assets/images/dental_treatment_room_1791650444673.jpg"
                alt="Sterile dental operatory with ergonomic patient chair"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md aspect-[4/3] bg-slate-100 border border-slate-200">
              <img
                src="/src/assets/images/dental_diagnostic_suite_1791650458180.jpg"
                alt="Digital radiography and 3D dental diagnostics workstation"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="col-span-2 rounded-2xl overflow-hidden shadow-md aspect-[16/9] bg-slate-100 border border-slate-200">
              <img
                src="/src/assets/images/dental_care_consultation_1791650472918.jpg"
                alt="Transparent dental consultation and tooth anatomy discussion"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Pillars of Care */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#DDF4F0] text-[#0B6B68] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172B3A] mb-1">
                  Hospital-Grade Sterilization Protocols
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every instrument undergoes multi-barrier ultrasonic cleaning and Class-B autoclave vacuum sterilization. Pre-sealed sterile pouches are only opened in front of the patient.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#DDF4F0] text-[#0B6B68] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172B3A] mb-1">
                  Low-Radiation Digital Radiovisiography (RVG)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Digital intraoral sensors reduce radiographic exposure by up to 80% compared to traditional dental X-rays, providing instantaneous high-definition tooth imaging on chairside monitors.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#DDF4F0] text-[#0B6B68] flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172B3A] mb-1">
                  Transparent Counsel & Zero High-Pressure Sales
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We believe in empowering patients through clear explanations of root causes, preventive habits, and conservative treatment alternatives. We never recommend unnecessary procedures.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#DDF4F0] text-[#0B6B68] flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172B3A] mb-1">
                  Micro-Aesthetic & Natural Smile Preservation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Whether performing tooth-saving endodontics or designing ceramic veneers and crowns, our clinical focus is on bio-mimicking natural tooth strength, translucency, and bite harmony.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
