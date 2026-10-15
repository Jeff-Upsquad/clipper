import React from 'react';
import { Zap, Sparkles, Layout, HardDrive } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Quick Processing',
      desc: 'Lightning fast processing for effortless clip cutting without waiting.',
      icon: Zap,
      gradient: 'from-slate-900 to-black text-[#FFFF99]'
    },
    {
      title: 'HD & 4K Quality',
      desc: 'Download your clips in pristine original quality formats up to 4K resolution.',
      icon: Sparkles,
      gradient: 'from-slate-900 to-black text-[#FFFF99]'
    },
    {
      title: 'Clean Interface',
      desc: 'Enjoy a simple, user-friendly interface designed for easy and intuitive cutting.',
      icon: Layout,
      gradient: 'from-slate-900 to-black text-[#FFFF99]'
    },
    {
      title: 'Bandwidth Saving',
      desc: 'Save gigabytes of bandwidth by grabbing only the exact segment you need.',
      icon: HardDrive,
      gradient: 'from-slate-900 to-black text-[#FFFF99]'
    }
  ];

  return (
    <section id="features" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Features
          </h2>
          <p className="text-base text-slate-600 mt-2 font-normal">
            Powerful features that simplify and supercharge your YouTube clipping workflow
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-tr ${f.gradient} flex items-center justify-center text-white mb-5 shadow-md shadow-slate-200 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
