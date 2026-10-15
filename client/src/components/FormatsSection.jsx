import React from 'react';

export default function FormatsSection() {
  const formats = [
    {
      ext: 'MP4',
      type: 'Video',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-600',
      tagColor: 'bg-blue-50 text-blue-600 border-blue-200',
      desc: 'Universal video format. Plays on every device, browser, and platform without extra apps.'
    },
    {
      ext: 'MP3',
      type: 'Audio',
      badge: 'Best for Audio',
      badgeColor: 'bg-purple-600',
      tagColor: 'bg-purple-50 text-purple-600 border-purple-200',
      desc: 'Extract audio only from any YouTube video. Perfect for music, podcasts, and interviews.'
    },
    {
      ext: 'WebM',
      type: 'Video',
      badge: 'Lightweight',
      badgeColor: 'bg-emerald-600',
      tagColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      desc: 'Smaller file size than MP4. Ideal for web embeds, modern browsers, and smooth streaming.'
    },
    {
      ext: 'M4A',
      type: 'Audio',
      tagColor: 'bg-orange-50 text-orange-600 border-orange-200',
      desc: 'Apple-native audio format. High fidelity with compact file size, great for iOS devices.'
    },
    {
      ext: 'OGG',
      type: 'Audio',
      tagColor: 'bg-teal-50 text-teal-600 border-teal-200',
      desc: 'Open-source audio container widely supported on Linux, gaming engines, and media players.'
    },
    {
      ext: 'Opus',
      type: 'Audio',
      tagColor: 'bg-rose-50 text-rose-600 border-rose-200',
      desc: 'Next-gen audio codec with excellent quality at very low bitrates. Ideal for voice & stream.'
    }
  ];

  return (
    <section id="formats" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            6 Formats to Download Your YouTube Clip
          </h2>
          <p className="text-base text-slate-600 mt-2 font-normal">
            Choose the format that fits your device, workflow, or social media platform. All free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {formats.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${f.tagColor}`}>
                    {f.ext}
                  </span>
                  {f.badge && (
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${f.badgeColor}`}>
                      {f.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{f.ext}</h3>
                  <span className="text-xs text-slate-400 font-semibold">{f.type}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
