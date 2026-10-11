import React, { useState } from 'react';
import { GalleryItem } from '../types/index.ts';
import { ZoomIn, X } from 'lucide-react';

interface GalleryProps {
  items: GalleryItem[];
}

export const Gallery: React.FC<GalleryProps> = ({ items }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  const categories = [
    { key: 'all', label: 'All Photos' },
    { key: 'interior', label: 'Reception & Lounge' },
    { key: 'operatory', label: 'Treatment Operatory' },
    { key: 'equipment', label: 'Diagnostics & Equipment' },
    { key: 'consultation', label: 'Consultation Suite' },
  ];

  const filteredItems = activeTab === 'all'
    ? items
    : items.filter((item) => item.category === activeTab);

  return (
    <section id="gallery" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0B6B68] mb-2">
              Virtual Facility Tour
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172B3A]">
              Inside Smile Architect Clinic
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-xl">
              Take a look inside our modern facility at Hebbal 2nd Stage, Mysuru. Designed for maximum hygiene, soothing comfort, and clinical accuracy.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-[#0B6B68] text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#172B3A] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeImage && (
          <div
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="relative aspect-[16/10] bg-slate-900">
                <img
                  src={activeImage.imageUrl}
                  alt={activeImage.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setActiveImage(null)}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-base font-bold text-[#172B3A] mb-1">
                  {activeImage.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeImage.caption}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
