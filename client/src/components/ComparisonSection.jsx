import React from 'react';
import { Check, X } from 'lucide-react';

export default function ComparisonSection() {
  const comparisons = [
    { feature: 'Trim Before Downloading', ytClipper: true, typical: false },
    { feature: 'No Full Video Download Needed', ytClipper: true, typical: false },
    { feature: 'Original Quality, No Re-encoding', ytClipper: true, typical: false },
    { feature: 'MP3 / Audio Only Extraction', ytClipper: true, typical: false },
    { feature: 'No Software Installation', ytClipper: true, typical: true },
    { feature: 'Zero Watermarks', ytClipper: true, typical: false },
    { feature: 'Supports 4K / 1080p Resolutions', ytClipper: true, typical: false }
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Clipper vs Other YouTube Download Tools
          </h2>
          <p className="text-base text-slate-600 mt-2 font-normal">
            Most tools make you download the entire multi-gigabyte video first. Clipper gives you just the clip.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-900 py-4 px-6 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
            <div className="col-span-6 sm:col-span-7">Feature</div>
            <div className="col-span-3 sm:col-span-2 text-center text-[#FFFF99] font-black">Clipper</div>
            <div className="col-span-3 sm:col-span-3 text-center text-slate-400">Typical Tool</div>
          </div>

          <div className="divide-y divide-slate-100">
            {comparisons.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 py-4 px-6 items-center text-xs sm:text-sm hover:bg-slate-50/70 transition-colors">
                <div className="col-span-6 sm:col-span-7 font-bold text-slate-800">
                  {item.feature}
                </div>
                <div className="col-span-3 sm:col-span-2 flex justify-center">
                  <div className="w-7 h-7 rounded-full bg-[#FFFF99] text-[#0A0A0A] border border-amber-300 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
                <div className="col-span-3 sm:col-span-3 flex justify-center">
                  {item.typical ? (
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
