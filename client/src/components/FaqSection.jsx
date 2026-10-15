import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Can I cut a YouTube video on my phone or tablet?',
      a: 'Yes. Clipper runs entirely in your browser with no software or extension to install, so it works flawlessly on any device — iPhone, iPad, Android, tablet, laptop, or desktop. Just open the site, paste your YouTube link, and cut your clip.'
    },
    {
      q: 'Can I cut multiple clips from the same YouTube video?',
      a: 'Yes. You can create as many clips as you need from the same video. Simply adjust the start and end times, click "Trim Now", and process each clip individually. All your clips will stay listed in your "My Clips" drawer.'
    },
    {
      q: 'Do I need a YouTube account to cut videos with Clipper?',
      a: 'No YouTube account is required. Clipper only needs the public URL or video ID of the video you want to cut. As long as the video is publicly available on YouTube, you can cut any clip from it instantly.'
    },
    {
      q: 'What is the best format for sharing YouTube clips on social media?',
      a: 'MP4 is the best choice for social media. It is accepted by every major platform including Instagram, TikTok, YouTube Shorts, Twitter/X, and Facebook, and plays natively on every device. For audio-only clips such as podcast highlights or music, MP3 is the most universally compatible option.'
    },
    {
      q: 'Can I close the browser while my clip is being processed?',
      a: 'Yes. Clip processing happens on the server, not in your browser tab. Once you have submitted your clip request, the system processes it in the background.'
    },
    {
      q: 'What happens if the YouTube video is private or age-restricted?',
      a: 'Clipper can process publicly accessible YouTube videos. Private videos, members-only content, or DRM-protected streams require special access.'
    },
    {
      q: 'How many clips can I create per day?',
      a: 'There are no limits! You can create unlimited clips across any number of videos without restrictions.'
    },
    {
      q: 'What quality will my cut clip be?',
      a: 'Clipper cuts videos in their original source resolution up to 4K (2160p), 1080p Full HD, and 720p HD with zero re-encoding loss.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-600 mt-2 font-normal">
            Everything you need to know about cutting YouTube videos with Clipper
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-900 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full py-4.5 px-6 flex items-center justify-between text-left cursor-pointer hover:bg-[#FFFF99]/20 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-black font-bold' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-slate-100 bg-[#FFFF99]/10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
