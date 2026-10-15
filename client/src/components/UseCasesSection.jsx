import React from 'react';
import { 
  Share2, Laugh, Trophy, Archive, Sparkles, BookOpen, 
  Presentation, Search, Calendar, GraduationCap, ThumbsUp, Megaphone 
} from 'lucide-react';

export default function UseCasesSection() {
  const useCases = [
    { title: 'Social Media Clips', icon: Share2 },
    { title: 'Memes Sharing', icon: Laugh },
    { title: 'Sharing Highlights', icon: Trophy },
    { title: 'Archiving Moments', icon: Archive },
    { title: 'Content Creation', icon: Sparkles },
    { title: 'Educational Snippets', icon: BookOpen },
    { title: 'Presentations & Pitches', icon: Presentation },
    { title: 'Research & Analysis', icon: Search },
    { title: 'Event Highlights', icon: Calendar },
    { title: 'Tutorial Creation', icon: GraduationCap },
    { title: 'Product Reviews', icon: ThumbsUp },
    { title: 'Advertisements', icon: Megaphone }
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Use Cases
          </h2>
          <p className="text-base text-slate-600 mt-2 font-normal">
            Explore endless purposes for cutting and sharing your favorite YouTube moments
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {useCases.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <div
                key={idx}
                className="p-5 bg-slate-50/70 hover:bg-[#FFFF99]/30 rounded-2xl border border-slate-200 hover:border-slate-900 text-center flex flex-col items-center justify-center gap-3 transition-all group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-[#FFFF99] border-2 border-slate-200 group-hover:border-black text-slate-800 group-hover:text-black flex items-center justify-center transition-all shadow-2xs group-hover:scale-105">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-black transition-colors leading-tight">
                  {uc.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
