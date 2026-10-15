import React from 'react';

export default function StatsSection() {
  const stats = [
    { value: '10M+', label: 'Clips Processed' },
    { value: '4K', label: 'Max Resolution' },
    { value: '99.9%', label: 'Success Rate' },
    { value: '500K+', label: 'Satisfied Users' }
  ];

  return (
    <section className="py-12 bg-white border-y border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {stats.map((s, idx) => (
            <div key={idx} className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight bg-[#FFFF99] inline-block px-3 py-0.5 rounded-xl border border-amber-300 shadow-2xs">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
