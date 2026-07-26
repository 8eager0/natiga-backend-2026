import React from 'react';
import { Sparkles, ExternalLink, GraduationCap, Award, Compass } from 'lucide-react';
import { useAds } from './AdsContext';

const DIRECT_LINK_URL = 'https://www.effectivecpmnetwork.com/gf26fn1tk?key=8dddfc9479287281950cacc886d870c2';

export default function ScoreTargetedAd({ percentage = 75, branch = 'علمي علوم' }) {
  const { adsEnabled } = useAds();

  if (!adsEnabled) return null;

  // Determine personalized content based on student score
  const getOfferDetails = () => {
    if (percentage >= 85) {
      return {
        badge: '🎉 مبروك المجموع الممتاز!',
        title: 'القبول المباشر بمنح كليات الطب والهندسة والذكاء الاصطناعي 2026',
        subtitle: 'احجز مقعدك في الجامعات الأهلية والخاصة المعتمدة بخصومات تفوق 35% للمتفوقين',
        buttonText: 'استكشف المنح المتاحة لمجموعك',
        icon: Award,
        gradient: 'from-amber-600 via-emerald-600 to-teal-700',
      };
    } else if (percentage >= 65) {
      return {
        badge: '🎓 مجموعك يفتح لك آفاق واسعة!',
        title: 'تنسيق الكليات والمعاهد المعتمدة المناسبة لمجموعك الآن',
        subtitle: 'تعرف على الشواغر المتاحة بدفعات 2026 والحد الأدنى للقبول بالمرحلة الأولى والثانية',
        buttonText: 'عرض الكليات المناسبة لمجموعك',
        icon: GraduationCap,
        gradient: 'from-blue-600 via-indigo-600 to-purple-700',
      };
    } else {
      return {
        badge: '📚 فرصتك قائمة لمستقبل واعد!',
        title: 'أفضل المعاهد العليا والكليات التكنولوجية المعتمة من الوزارة',
        subtitle: 'فرص دراسية متميزة تضمن لك سوق العمل بشهادات معتمدة رسمياً بدفعات 2026',
        buttonText: 'استكشف الفرص والمعاهد المتاحة',
        icon: Compass,
        gradient: 'from-emerald-600 via-teal-600 to-sky-700',
      };
    }
  };

  const offer = getOfferDetails();
  const IconComponent = offer.icon;

  return (
    <div className="my-6">
      <a
        href={DIRECT_LINK_URL}
        target="_blank"
        rel="noreferrer"
        className={`group bg-gradient-to-r ${offer.gradient} text-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl hover:shadow-2xl transition-all border border-white/20 transform hover:-translate-y-0.5 relative overflow-hidden`}
      >
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <IconComponent className="w-6 h-6 animate-pulse" />
          </div>

          <div className="text-right space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-[11px] font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{offer.badge}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black leading-snug">
              {offer.title}
            </h3>
            <p className="text-xs text-white/90 font-semibold leading-relaxed max-w-xl">
              {offer.subtitle}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-900 group-hover:bg-slate-100 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap shadow-md transition-colors shrink-0">
          <span>{offer.buttonText}</span>
          <ExternalLink className="w-4 h-4 text-emerald-600" />
        </div>
      </a>
    </div>
  );
}
