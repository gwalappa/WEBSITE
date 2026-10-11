import React from 'react';
import { Calendar, Award, Languages, GraduationCap } from 'lucide-react';
import { Dentist } from '../types/index.ts';

interface DoctorsProps {
  dentists: Dentist[];
  onBookWithDentist: (dentistId: string) => void;
}

export const Doctors: React.FC<DoctorsProps> = ({ dentists, onBookWithDentist }) => {
  return (
    <section id="doctors" className="py-20 bg-[#F5F8F8] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0B6B68] mb-2">
            Clinical Leadership
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172B3A]">
            Meet Our Dental Specialists
          </h2>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            Led by verified post-graduate dental surgeons offering specialized expertise across restorative, aesthetic, and conservative dentistry in Mysuru.
          </p>
        </div>

        {/* Doctors Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dentists.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#172B3A] group-hover:text-[#0B6B68] transition-colors">
                      {doc.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <GraduationCap className="w-4 h-4 text-[#0B6B68]" />
                      <span>{doc.qualifications}</span>
                    </div>
                  </div>

                  {doc.experienceYears && (
                    <div className="px-3 py-1 bg-[#DDF4F0]/60 rounded-lg text-right shrink-0">
                      <span className="text-xs font-bold text-[#0B6B68] tabular-nums block">
                        {doc.experienceYears}+ Years
                      </span>
                      <span className="text-[10px] text-slate-500 block">Experience</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  {doc.bio}
                </p>

                {/* Verified Specializations */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Key Clinical Focus
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <Languages className="w-3.5 h-3.5 text-[#0B6B68]" />
                  <span>Languages Spoken: {doc.languages.join(', ')}</span>
                </div>
              </div>

              {/* Book Action */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Practices Mon – Sat
                </span>

                <button
                  onClick={() => onBookWithDentist(doc.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0B6B68] rounded-xl hover:bg-[#085552] transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book with Doctor</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
