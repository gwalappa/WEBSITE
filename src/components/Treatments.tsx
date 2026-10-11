import React, { useState } from 'react';
import { Search, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Service } from '../types/index.ts';

interface TreatmentsProps {
  services: Service[];
  onSelectServiceToBook: (service: Service) => void;
}

export const Treatments: React.FC<TreatmentsProps> = ({
  services,
  onSelectServiceToBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="treatments" className="py-20 bg-[#F5F8F8] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0B6B68] mb-2">
              Clinical Specializations & Care
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172B3A]">
              Treatments & Services
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-xl">
              Comprehensive dental solutions delivered with precision, modern clinical equipment, and patient comfort at the core.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]/30 focus:border-[#0B6B68]"
            />
          </div>
        </div>

        {/* Category Filters (Strict Anti-Slop: Functional filter buttons, clean active styling) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#0B6B68] text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/70 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                {/* Quiet unboxed metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>{service.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3 h-3 text-[#0B6B68]" />
                    <span className="tabular-nums">{service.durationMinutes} mins</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#172B3A] mb-2.5 group-hover:text-[#0B6B68] transition-colors">
                  {service.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {service.shortDescription}
                </p>

                {/* Fee Transparency Notice */}
                <div className="mb-6 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0B6B68] shrink-0 mt-0.5" />
                  <span>{service.feeNotice || 'Transparent fee communicated during clinical visit.'}</span>
                </div>
              </div>

              {/* Book CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-medium">
                  Instant Online Scheduling
                </span>

                <button
                  onClick={() => onSelectServiceToBook(service)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0B6B68] rounded-xl hover:bg-[#085552] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book This Service</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if search yields nothing */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No treatments found matching "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 text-xs text-[#0B6B68] font-bold underline"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Clinical Disclaimer Requirement */}
        <div className="mt-12 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Clinical Notice:</strong> Online appointment booking reserves your consultation chair with the dentist. It does not replace a clinical examination, radiographic diagnostics, or physical inspection. Complete diagnostic findings and personalized treatment options are discussed thoroughly in person.
          </p>
        </div>

      </div>
    </section>
  );
};
