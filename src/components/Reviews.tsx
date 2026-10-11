import React from 'react';
import { Star, ExternalLink, ShieldCheck, MessageSquareQuote } from 'lucide-react';
import { Testimonial } from '../types/index.ts';

interface ReviewsProps {
  testimonials: Testimonial[];
}

export const Reviews: React.FC<ReviewsProps> = ({ testimonials }) => {
  return (
    <section id="reviews" className="py-20 bg-[#F5F8F8] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0B6B68] mb-2">
              Verified Patient Experiences
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172B3A]">
              Patient Reviews & Feedback
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-xl">
              Authentic feedback from patients treated at Smile Architect Dental Clinic in Mysuru.
            </p>
          </div>

          {/* Google Profile Badge & Link */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 font-bold text-lg tabular-nums">
              4.8
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                Google Rating · 150 Reviews
              </p>
              <a
                href="https://maps.app.goo.gl/m6FKojfRqpNL3FDQ8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#0B6B68] font-bold hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>View Google Maps Listing</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & Source */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t.source}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#172B3A]">{t.patientName}</h4>
                  <p className="text-[11px] text-slate-500">{t.treatment}</p>
                </div>
                <div className="flex items-center gap-1 text-[#0B6B68] text-[10px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
