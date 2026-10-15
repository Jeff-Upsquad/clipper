import React from 'react';
import { Video, Scissors, Check, X } from 'lucide-react';

export default function BeforeAfterSection() {
  return (
    <section className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Stop Downloading What You Don't Need
          </h2>
          <p className="text-base text-slate-600 mt-2 font-normal">
            Most tools make you grab the whole massive video first. Clipper skips that entirely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
          {/* Left Card: Full Video Download */}
          <div className="bg-slate-50/80 rounded-2xl p-7 border border-slate-200/80 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Full Video Download</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-slate-400 font-mono">~1.8 GB</span>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden">
                  <div className="bg-slate-400 h-2.5 rounded-full w-full" />
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Takes 10 - 30 minutes to download</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Requires heavy video editing software</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Wastes disk storage on footage you skip</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Needs re-exporting with quality loss</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Floating VS badge on desktop */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border-2 border-slate-900 shadow-lg items-center justify-center font-black text-xs text-slate-900">
            VS
          </div>

          {/* Right Card: YT clipper Clip */}
          <div className="bg-[#FFFF99]/25 rounded-2xl p-7 border-2 border-slate-900 shadow-xl shadow-amber-200/20 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] text-[#FFFF99] border border-black flex items-center justify-center shadow-md">
                  <Scissors className="w-5 h-5 -rotate-45 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Clipper Trimmed Clip</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-black text-[#0A0A0A] font-mono">~4.2 MB</span>
                <div className="w-full bg-slate-200 rounded-full h-3 mt-2 overflow-hidden border border-slate-300">
                  <div className="bg-[#FFFF99] h-3 rounded-full w-[6%] border-r border-slate-900" />
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 font-bold">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Ready to download in just seconds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Runs entirely in browser, no software needed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Only the exact segment you actually want</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Original quality with zero re-encoding</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
