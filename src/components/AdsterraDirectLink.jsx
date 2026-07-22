import React from 'react';
import { ExternalLink, Sparkles, Gift } from 'lucide-react';

const DIRECT_LINK_URL = 'https://www.effectivecpmnetwork.com/gf26fn1tk?key=8dddfc9479287281950cacc886d870c2';

export default function AdsterraDirectLink({ className = '' }) {
  return (
    <div className={`my-6 ${className}`}>
      <a
        href={DIRECT_LINK_URL}
        target="_blank"
        rel="noreferrer"
        className="group bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all border border-amber-300/30 transform hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wide mb-1">
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>عرض مخصص للطلاب 2026</span>
            </div>
            <h4 className="text-sm sm:text-base font-black leading-snug">
              اضغط هنا للاطلاع على أهم المنح الدراسية والدورات التدريبية المتاحة لمجموعك
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/20 group-hover:bg-white/30 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-colors">
          <span>دخول الخدمة</span>
          <ExternalLink className="w-4 h-4" />
        </div>
      </a>
    </div>
  );
}
