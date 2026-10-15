import React from 'react';
import { ClipboardPaste, Scissors, Download, ArrowRight } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Paste YouTube URL',
      desc: 'Copy the link of any YouTube video or short and paste it into the input field above.',
      icon: ClipboardPaste
    },
    {
      num: '02',
      title: 'Select Time Range',
      desc: 'Choose the exact start and end times for your clip using our intuitive dual slider.',
      icon: Scissors
    },
    {
      num: '03',
      title: 'Download Your Clip',
      desc: 'Click "Trim Now" and your trimmed clip in original quality is ready for download in seconds.',
      icon: Download
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How to Cut and Download YouTube Videos
          </h2>
          <p className="text-base text-slate-600 mt-2 font-normal">
            Three simple steps to cut any YouTube video and download just the clip you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-50/70 rounded-2xl p-7 border border-slate-200/90 flex flex-col items-start group hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all"
              >
                <div className="w-full flex items-center justify-between mb-5">
                  <span className="font-mono text-3xl font-black text-slate-300 group-hover:text-black transition-colors">
                    {s.num}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-[#FFFF99] border-2 border-slate-200 group-hover:border-black text-[#0A0A0A] flex items-center justify-center transition-all shadow-2xs group-hover:scale-105">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
