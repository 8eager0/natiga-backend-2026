import React, { useState, useMemo } from 'react';
import { GraduationCap, Sparkles, CheckCircle2, AlertCircle, Search, Compass, Award, BookOpen, ChevronLeft } from 'lucide-react';

const COLLEGE_DATA = [
  // ================= علمي علوم =================
  { name: 'كلية الطب البشري', minPercent: 91.5, branch: 'علمي علوم', category: 'القطاع الطبي', stage: 'المرحلة الأولى', icon: '🩺' },
  { name: 'كلية طب الأسنان', minPercent: 90.8, branch: 'علمي علوم', category: 'القطاع الطبي', stage: 'المرحلة الأولى', icon: '🦷' },
  { name: 'كلية العلاج الطبيعي', minPercent: 90.1, branch: 'علمي علوم', category: 'القطاع الطبي', stage: 'المرحلة الأولى', icon: '🦴' },
  { name: 'كلية الصيدلة', minPercent: 89.5, branch: 'علمي علوم', category: 'القطاع الطبي', stage: 'المرحلة الأولى', icon: '💊' },
  { name: 'كلية الطب البيطري', minPercent: 85.5, branch: 'علمي علوم', category: 'القطاع الطبي', stage: 'المرحلة الثانية', icon: '🐾' },
  { name: 'حاسبات ومعلومات (تخصص علوم)', minPercent: 86.5, branch: 'علمي علوم', category: 'الحاسبات والذكاء الاصطناعي', stage: 'المرحلة الأولى', icon: '💻' },
  { name: 'كلية العلوم', minPercent: 81.0, branch: 'علمي علوم', category: 'العلوم الأساسية', stage: 'المرحلة الثانية', icon: '🔬' },
  { name: 'كلية التمريض', minPercent: 73.5, branch: 'علمي علوم', category: 'القطاع الطبي', stage: 'المرحلة الثانية', icon: '🏥' },
  { name: 'كلية العلوم الصحية التطبيقية', minPercent: 82.0, branch: 'علمي علوم', category: 'القطاع الطبي', stage: 'المرحلة الثانية', icon: '⚡' },
  { name: 'كلية الزراعة', minPercent: 62.0, branch: 'علمي علوم', category: 'العلوم الزراعية', stage: 'المرحلة الثالثة', icon: '🌱' },

  // ================= علمي رياضة =================
  { name: 'كلية الهندسة', minPercent: 83.5, branch: 'علمي رياضة', category: 'القطاع الهندسي', stage: 'المرحلة الأولى', icon: '🏗️' },
  { name: 'كلية الحاسبات والمعلومات والذكاء الاصطناعي', minPercent: 79.5, branch: 'علمي رياضة', category: 'الحاسبات والذكاء الاصطناعي', stage: 'المرحلة الأولى', icon: '🤖' },
  { name: 'كلية الملاحة وتكنولوجيا الفضاء', minPercent: 84.0, branch: 'علمي رياضة', category: 'التكنولوجيا الحديثة', stage: 'المرحلة الأولى', icon: '🚀' },
  { name: 'كلية الفنون التطبيقية', minPercent: 74.0, branch: 'علمي رياضة', category: 'الفنون والتصميم', stage: 'المرحلة الثانية', icon: '🎨' },
  { name: 'كلية التخطيط العمراني', minPercent: 78.0, branch: 'علمي رياضة', category: 'القطاع الهندسي', stage: 'المرحلة الأولى', icon: '📐' },
  { name: 'كلية العلوم (رياضة)', minPercent: 68.0, branch: 'علمي رياضة', category: 'العلوم الأساسية', stage: 'المرحلة الثانية', icon: '📐' },
  { name: 'المعاهد الهندسية العليا التخصصية', minPercent: 60.0, branch: 'علمي رياضة', category: 'القطاع الهندسي', stage: 'المرحلة الثالثة', icon: '⚙️' },

  // ================= أدبي =================
  { name: 'كلية الاقتصاد والعلوم السياسية', minPercent: 86.5, branch: 'أدبي', category: 'العلوم الإنسانية واللغات', stage: 'المرحلة الأولى', icon: '🏛️' },
  { name: 'كلية الألسن', minPercent: 81.5, branch: 'أدبي', category: 'العلوم الإنسانية واللغات', stage: 'المرحلة الأولى', icon: '🌍' },
  { name: 'كلية الإعلام', minPercent: 79.0, branch: 'أدبي', category: 'الإعلام والاتصال', stage: 'المرحلة الأولى', icon: '🎙️' },
  { name: 'كلية الآثار', minPercent: 75.0, branch: 'أدبي', category: 'العلوم الإنسانية واللغات', stage: 'المرحلة الثانية', icon: '🏺' },
  { name: 'كلية التربية (عام)', minPercent: 66.0, branch: 'أدبي', category: 'التربية والتعليم', stage: 'المرحلة الثانية', icon: '📚' },
  { name: 'كلية التجارة', minPercent: 63.0, branch: 'أدبي', category: 'العلوم التجارية', stage: 'المرحلة الثانية', icon: '📊' },
  { name: 'كلية الآداب', minPercent: 59.0, branch: 'أدبي', category: 'العلوم الإنسانية واللغات', stage: 'المرحلة الثالثة', icon: '📖' },
  { name: 'كلية الحقوق', minPercent: 55.0, branch: 'أدبي', category: 'القانون والسياسة', stage: 'المرحلة الثالثة', icon: '⚖️' },
  { name: 'كلية السياحة والفنادق', minPercent: 52.0, branch: 'أدبي', category: 'السياحة والخدمات', stage: 'المرحلة الثالثة', icon: '🏨' },

  // ================= مشتركة (للكل) =================
  { name: 'كلية الفنون الجميلة (عمارة / فنون)', minPercent: 68.0, branch: 'مشترك', category: 'الفنون والتصميم', stage: 'المرحلة الثانية', icon: '🖌️' },
  { name: 'كلية التربية الرياضية', minPercent: 50.0, branch: 'مشترك', category: 'التربية والتعليم', stage: 'المرحلة الثالثة', icon: '⚽' },
  { name: 'كلية التربية النوعية / الموسيقية', minPercent: 50.0, branch: 'مشترك', category: 'التربية والتعليم', stage: 'المرحلة الثالثة', icon: '🎵' },
  { name: 'المعاهد الفنية والتجارية والحاسب الآلي', minPercent: 50.0, branch: 'مشترك', category: 'العلوم التجارية', stage: 'المرحلة الثالثة', icon: '💻' }
];

export default function CollegePredictor({ studentPercentage, studentBranch = 'علمي علوم' }) {
  const [selectedBranch, setSelectedBranch] = useState(studentBranch || 'علمي علوم');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'guaranteed' | 'possible'

  const score = parseFloat(studentPercentage || 0);

  // Filter colleges according to branch and score
  const predictedColleges = useMemo(() => {
    return COLLEGE_DATA.filter(c => {
      // Branch check
      const matchBranch = c.branch === selectedBranch || c.branch === 'مشترك';
      if (!matchBranch) return false;

      // Text Search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        const matchName = c.name.toLowerCase().includes(query);
        const matchCat = c.category.toLowerCase().includes(query);
        if (!matchName && !matchCat) return false;
      }

      // Status Filter
      if (statusFilter === 'guaranteed') {
        return score >= c.minPercent;
      }
      if (statusFilter === 'possible') {
        return score >= (c.minPercent - 2.5);
      }

      return true;
    }).map(c => {
      let fitStatus = 'out'; // 'guaranteed' | 'possible' | 'out'
      let fitLabel = 'تتطلب مجموع أعلى';
      let badgeBg = 'bg-slate-800 text-slate-400 border-slate-700';

      if (score >= c.minPercent + 1.0) {
        fitStatus = 'guaranteed';
        fitLabel = 'مضمونة بنسبة كبيرة 🟢';
        badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      } else if (score >= c.minPercent - 2.0) {
        fitStatus = 'possible';
        fitLabel = 'محتملة (على الحدود) 🟡';
        badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      }

      return { ...c, fitStatus, fitLabel, badgeBg };
    }).sort((a, b) => {
      // Prioritize guaranteed & possible
      const order = { guaranteed: 1, possible: 2, out: 3 };
      return order[a.fitStatus] - order[b.fitStatus] || b.minPercent - a.minPercent;
    });
  }, [selectedBranch, searchQuery, statusFilter, score]);

  const guaranteedCount = useMemo(() => {
    return COLLEGE_DATA.filter(c => (c.branch === selectedBranch || c.branch === 'مشترك') && score >= c.minPercent).length;
  }, [selectedBranch, score]);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 my-8 border border-slate-800 shadow-2xl relative overflow-hidden text-right">
      
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black mb-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>مؤشرات التنسيق الحكومي والخاص المتوقع 2026</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-emerald-400" />
              <span>حاسبة الكليات والتنسيق المتوقع لمجموعك</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              بناءً على النسبة المئوية لمجموعك (<span className="text-emerald-400 font-black">{score}%</span>)، إليك قائمة الكليات المتاحة المتوقعة:
            </p>
          </div>

          {/* Quick Counter Badge */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3 text-center sm:text-right min-w-[170px]">
            <span className="text-[11px] font-bold text-slate-400 block mb-0.5">الكليات المؤهل لها</span>
            <span className="text-2xl font-black text-emerald-400">{guaranteedCount} كليات متوقعة</span>
          </div>
        </div>

        {/* Branch Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex p-1 bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full sm:w-auto">
            {['علمي علوم', 'علمي رياضة', 'أدبي'].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  selectedBranch === b
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute top-3.5 right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الكلية..."
              className="w-full pr-9 pl-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg border transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white border-slate-500'
                : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            عرض الكل ({predictedColleges.length})
          </button>
          <button
            onClick={() => setStatusFilter('guaranteed')}
            className={`px-3.5 py-1.5 rounded-lg border transition-all ${
              statusFilter === 'guaranteed'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800/60 text-emerald-400/80 border-slate-800 hover:text-emerald-300'
            }`}
          >
            الكليات المضمونة فقط 🟢
          </button>
        </div>

        {/* Colleges Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {predictedColleges.length > 0 ? (
            predictedColleges.map((col, idx) => (
              <div
                key={idx}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 transition-all hover:border-emerald-500/50 hover:bg-slate-800/90 flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-2xl">{col.icon}</span>
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${col.badgeBg}`}>
                      {col.fitLabel}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {col.name}
                  </h4>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-1">
                    <span>{col.category}</span>
                    <span>•</span>
                    <span className="text-slate-300">{col.stage}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">الحد الأدنى المتوقع:</span>
                  <span className="text-amber-400 font-mono font-black text-sm">{col.minPercent}%</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="font-bold">لم نجد كليات تطابق فلتر البحث الحقيقي.</p>
              <p className="text-xs">جرب تقليل كلمات البحث أو فتح فلتر العرض لمشاهدة جميع التخصصات المتاحة.</p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 font-semibold text-center border-t border-slate-800 pt-4">
          * المؤشرات الواردة بالحاسبة مبنية على الحدود الأدنى للتنسيق الرسمي المعتمد للعام السابق ومعدلات شرائح التكراري.
        </p>

      </div>
    </div>
  );
}
