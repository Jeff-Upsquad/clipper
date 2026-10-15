import React from 'react';
import { Scissors } from 'lucide-react';

export default function Footer({ onSelectVideo }) {
  return (
    <footer className="bg-white border-t-2 border-slate-900 text-slate-600 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-[#FFFF99] text-[#FFFF99] flex items-center justify-center">
                <Scissors className="w-4 h-4 -rotate-45" />
              </div>
              <span className="font-black text-base text-slate-900 tracking-tight">
                <span className="bg-[#FFFF99] text-[#0A0A0A] px-2 py-0.5 rounded border border-amber-300 font-black">Clipper</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed font-normal">
              Fast, lossless, frame-accurate YouTube video & audio trimmer in Pale Yellow brand theme. 4K raw quality, no re-encoding.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Product</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#how-it-works" className="hover:text-black hover:underline transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-black hover:underline transition-colors">Features</a></li>
              <li><a href="#formats" className="hover:text-black hover:underline transition-colors">Supported Formats</a></li>
              <li><a href="#faq" className="hover:text-black hover:underline transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Formats */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Formats</h4>
            <ul className="space-y-2 font-medium">
              <li><span className="text-slate-600">MP4 (Video 4K / 1080p)</span></li>
              <li><span className="text-slate-600">WebM (VP9 Video)</span></li>
              <li><span className="text-slate-600">MP3 (320kbps Audio)</span></li>
              <li><span className="text-slate-600">M4A & Opus Audio</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Legal & Info</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Disclaimer</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px] font-medium">
          <div>
            Clipper® | Copyright © 2026. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FFFF99] border border-black inline-block mr-1"></span>
            <span>Palette: Pale Yellow (#FFFF99) · Brand.accent</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
