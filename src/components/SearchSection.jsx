import React, { useState, useEffect } from 'react';
import { Search, Hash, User, Sparkles, AlertCircle, ArrowLeft, CheckCircle, Send, ExternalLink, Server, Clock, Award } from 'lucide-react';
import { searchStudentsAsync } from '../data/studentsData';
import { API_BASE_URL } from '../config';
import AdsterraAd from './AdsterraAd';
import AdsterraNativeContainer from './AdsterraNativeContainer';
import AdsterraDirectLink from './AdsterraDirectLink';

export default function SearchSection({ onSelectStudent, customStudents = [] }) {
  const [searchType, setSearchType] = useState('seatNumber'); // 'seatNumber' | 'name'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStage, setLoadingStage] = useState(1);
  const [activeServer, setActiveServer] = useState(1);
  const [totalDbCount, setTotalDbCount] = useState(810980);

  // Check backend connection on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/info`)
      .then(res => res.json())
      .then(data => {
        if (data.totalCount) setTotalDbCount(data.totalCount);
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setLoadingStage(1);

    const timer1 = setTimeout(() => setLoadingStage(2), 1200);
    const timer2 = setTimeout(() => setLoadingStage(3), 2400);

    const matchedPromise = searchStudentsAsync(query, searchType, customStudents);
    const delayPromise = new Promise(resolve => setTimeout(resolve, 3400));

    const [matched] = await Promise.all([matchedPromise, delayPromise]);

    clearTimeout(timer1);
    clearTimeout(timer2);

    setResults(matched);
    setIsSearching(false);

    // If exact seat number single match, select directly
    if (searchType === 'seatNumber' && matched.length === 1) {
      onSelectStudent(matched[0]);
    }
  };

  return (
    <section class="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Hero Header */}
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm font-bold mb-4">
          <Sparkles class="w-4 h-4 text-amber-500 animate-pulse" />
          <span>ترقبوا إعلان نتيجة الثانوية العامة 2026 - النتائج لم تُعتمد رسمياً بعد</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-snug">
          نتيجة الثانوية العامة 2026
        </h1>
        <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
          أدخل <span class="font-black text-emerald-600 dark:text-emerald-400">رقم الجلوس</span> أو <span class="font-black text-amber-600 dark:text-amber-400">اسم الطالب</span> وسارع بالاستعلام فور اعتماد النتيجة رسمياً من الوزارة.
        </p>

        {/* Adsterra Top Leaderboard Ad Unit */}
        <div className="hidden md:block">
          <AdsterraAd adKey="9a45c769bb78d58a2940cdf3779cae7f" width={728} height={90} />
        </div>
        <div className="block md:hidden">
          <AdsterraAd adKey="73b413bfa62a149527b4f12554f5b827" width={320} height={50} />
        </div>
      </div>

      {/* Main Search Card Container */}
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800">
        
        {/* Multi-Server Selection Tabs */}
        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>اختر سيرفر الاستعلام السريع:</span>
            </span>
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              متصل وسريع (0.1ms)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveServer(1)}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border ${
                activeServer === 1
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>سيرفر 1 (الوزارة)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveServer(2)}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border ${
                activeServer === 2
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>سيرفر 2 (احتياطي)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveServer(3)}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border ${
                activeServer === 3
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>سيرفر 3 (سريع)</span>
            </button>
          </div>
        </div>

        {/* Toggle Search Mode: By Seat Number vs By Name */}
        <div class="flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              setSearchType('seatNumber');
              setQuery('');
              setHasSearched(false);
            }}
            class={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
              searchType === 'seatNumber'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Hash class="w-5 h-5 text-emerald-600" />
            <span>البحث برقم الجلوس</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchType('name');
              setQuery('');
              setHasSearched(false);
            }}
            class={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
              searchType === 'name'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User class="w-5 h-5 text-amber-500" />
            <span>البحث باسم الطالب</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} class="space-y-4">
          <div class="relative">
            <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
              {searchType === 'seatNumber' ? (
                <Hash class="w-6 h-6 text-emerald-600" />
              ) : (
                <User class="w-6 h-6 text-amber-500" />
              )}
            </div>
            
            <input
              type={searchType === 'seatNumber' ? 'number' : 'text'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchType === 'seatNumber'
                  ? 'أدخل رقم الجلوس (مثال: 102450)'
                  : 'أدخل اسم الطالب (مثال: سلمى أو أحمد)'
              }
              class="w-full pl-12 pr-12 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-2xl text-lg font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-right"
              required
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                class="absolute inset-y-0 left-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                إلغاء
              </button>
            )}
          </div>

          {/* Adsterra Native Banner (300x250) Container - Slot 1 (Between Input and Submit Button) */}
          <div className="my-6 flex justify-center items-center overflow-hidden min-h-[250px] rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 py-2">
            <AdsterraAd adKey="1f517a72be5215de5a96e2a8439c8139" width={300} height={250} />
          </div>

          {/* Instant Submit Button */}
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-lg shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSearching ? (
              <>
                <span class="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>جاري استخراج النتيجة...</span>
              </>
            ) : (
              <>
                <Search class="w-6 h-6" />
                <span>عرض النتيجة الآن</span>
              </>
            )}
          </button>

          {/* Telegram Channel Link */}
          <div className="mt-3">
            <a
              href="https://t.me/natigaa2026"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2.5 border border-sky-400/30 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Send className="w-5 h-5 animate-pulse text-sky-200" />
              <span>انضم لجروب التليجرام لمتابعة التنسيق لحظة بلحظة</span>
              <ExternalLink className="w-4 h-4 text-sky-200" />
            </a>
          </div>
        </form>
      </div>

      {/* Adsterra Direct Link & Native Container Ad Units */}
      <AdsterraDirectLink />
      <AdsterraNativeContainer />

      {/* High-Engagement 3-Stage Result Preparation Loader */}
      {isSearching && (
        <div className="mt-8 bg-white dark:bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          
          <div className="space-y-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>جاري المعالجة السريعة عبر {activeServer === 1 ? 'سيرفر 1 (الوزارة)' : activeServer === 2 ? 'سيرفر 2 (احتياطي)' : 'سيرفر 3 (سريع)'}</span>
            </span>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {loadingStage === 1 && 'جاري الاتصال بقواعد بيانات وزارة التربية والتعليم...'}
              {loadingStage === 2 && 'جاري استدعاء درجات المواد وتدقيق المجموع الكلي...'}
              {loadingStage === 3 && 'جاري تجهيز بطاقة النتيجة وحاسبة التنسيق المعتمدة...'}
            </h3>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full max-w-md mx-auto overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-700 ease-out"
                style={{ width: `${loadingStage * 33.3}%` }}
              ></div>
            </div>
          </div>

          {/* High-CTR Recommendation Card during result lookup */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <AdsterraDirectLink />
          </div>
        </div>
      )}

      {/* Results List View (when searching by name or multiple matches) */}
      {hasSearched && !isSearching && (
        <div className="mt-8">
          {results.length === 0 ? (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/40 border-2 border-amber-300/80 dark:border-amber-700/60 rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto shadow-inner">
                <AlertCircle className="w-9 h-9 animate-bounce" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-black">
                  <span>تنبيه هام - بوابة النتائج 2026</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
                  النتيجة لسه مطلعتش! 🎓
                </h3>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                عفواً، نتيجة امتحانات الثانوية العامة لعام 2026 لم تُعتمد رسمياً حتى الآن من وزارة التربية والتعليم والتعليم الفني. 
                <br className="hidden sm:inline" />
                يرجى متابعتنا، وسيتفعل الاستعلام السريع فور الإعلان الرسمي!
              </p>
              <div className="pt-3 flex justify-center">
                <a
                  href="https://t.me/natigaa2026"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>انضم لجروب التليجرام لتكون أول من يعلم فور الاعتماد</span>
                </a>
              </div>
            </div>
          ) : (
            <div class="space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h3 class="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle class="w-5 h-5 text-emerald-600" />
                  <span>نتائج البحث ({results.length})</span>
                  {isFilterActive && (
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                      المجموع: {minScore || 0} إلى {maxScore || 320}
                    </span>
                  )}
                </h3>
                <span class="text-xs text-slate-500 dark:text-slate-400">اختر الطالب لعرض بطاقة النتيجة</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((student) => (
                  <div
                    key={student.seatNumber + student.name}
                    onClick={() => onSelectStudent(student)}
                    class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group flex justify-between items-center"
                  >
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span class="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          رقم الجلوس: {student.seatNumber}
                        </span>
                      </div>
                      <h4 class="font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-base">
                        {student.name}
                      </h4>
                      <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        المجموع: {student.totalScore} / 320 ({((student.totalScore/320)*100).toFixed(2)}%)
                      </p>
                    </div>

                    <div class="text-left flex flex-col items-end gap-1">
                      <span class={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        student.status === 'ناجح'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {student.status}
                      </span>
                      <span class="text-xs text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
                        عرض النتيجة <ArrowLeft class="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adsterra Results Ad Unit */}
              <div className="pt-6 flex justify-center">
                <AdsterraAd adKey="1f517a72be5215de5a96e2a8439c8139" width={300} height={250} />
              </div>
            </div>
          )}
        </div>
      )}
      {/* On-Page SEO Structured Content for Google Search Indexing */}
      <article className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 text-slate-800 dark:text-slate-200">
        
        {/* H1 Primary Header */}
        <header className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 leading-snug">
            نتيجة الثانوية العامة 2026 برقم الجلوس والاسم
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            مرحباً بكم في البوابة الإلكترونية السريعة للحصول على <strong className="text-slate-900 dark:text-white font-bold">نتيجة الثانوية العامة 2026</strong>. يسعدنا تقديم خدمة <strong className="text-slate-900 dark:text-white font-bold">استعلام</strong> فورية ومباشرة لكافة طلاب وأولياء أمور الصف الثالث الثانوي في جميع محافظات مصر. بفضل سيرفراتنا الحديثة المرتبطة بقواعد بيانات <strong className="text-slate-900 dark:text-white font-bold">وزارة التربية والتعليم</strong>، يمكنك الآن كشف درجاتك التفصيلية والمجموع الكلي والنسبة المئوية فور اعتماد النتيجة رسمياً من الوزير.
          </p>
        </header>

        {/* H2 & H3 Steps Section */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>خطوات الاستعلام عن نتيجة الثانوية العامة برقم الجلوس</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            لتسهيل العملية على الطلاب وتجنب بطء السيرفرات الرسمية أثناء اعتماد النتائج، يتيح لك موقعنا عبر <strong className="text-emerald-600 dark:text-emerald-400 font-bold">الرابط الرسمي</strong> استخراج نتيجتك في ثوانٍ معدودة عبر اتباع الخطوات البسيطة التالية:
          </p>

          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-4">
            كيفية استخدام محرك بحث النتيجة السريع:
          </h3>

          <ol className="list-decimal list-inside space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            <li className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <strong className="text-emerald-700 dark:text-emerald-400">اختر طريقة البحث المناسبة:</strong> يمكنك تحديد نوع البحث المفضل لديك سواء عبر إدخال بيانات الطالب <span className="underline decoration-emerald-500 font-bold">برقم الجلوس</span> الخاص بك، أو البحث <span className="underline decoration-emerald-500 font-bold">بالاسم</span> الثلاثي أو الرباعي للوصول الفوري لبطاقة الدرجات.
            </li>
            <li className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <strong className="text-emerald-700 dark:text-emerald-400">أدخل البيانات في مربع البحث:</strong> قم بكتابة رقم الجلوس بدقة في الخانة المخصصة أعلاه، ثم تأكد من مراجعة الأرقام المكتوبة.
            </li>
            <li className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <strong className="text-emerald-700 dark:text-emerald-400">اضغط على زر استعلام:</strong> قم بالنقر على "عرض النتيجة الآن" ليبدأ السيرفر فوراً في معالجة طلبك واستدعاء تفاصيل بيان الدرجات من قاعدة البيانات.
            </li>
            <li className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <strong className="text-emerald-700 dark:text-emerald-400">استعرض تفاصيل بيان الدرجات:</strong> ستظهر لك بطاقة النتيجة الشاملة متضمنة درجات كل مادة دراسية (اللغة العربية، اللغة الأجنبية، المواد العلمية أو الأدبية)، بالإضافة إلى المجموع الكلي والنسبة المئوية وحالة الطالب (ناجح / دور ثانٍ).
            </li>
          </ol>
        </section>

        {/* H2 Official Features Section */}
        <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            ميزات الرابط الرسمي لاستخراج نتيجة الثانوية العامة 2026
          </h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            يقدم <strong className="text-emerald-600 dark:text-emerald-400">الرابط الرسمي</strong> عبر موقعنا تجربة استعلام فريدة تعتمد على سيرفرات فائقة السرعة تتحمل الضغط الجماهيري الهائل لحظة الإعلان الرسمي من قبل <strong className="text-slate-900 dark:text-white font-bold">وزارة التربية والتعليم والتعليم الفني</strong>. كما يوفر الموقع حاسبة التنسيق الذكية التي تتوقع الكليات والمعاهد المتاحة لمجموعك بناءً على ضوابط ومؤشرات التنسيق المعتمدة لهذا العام.
          </p>
        </section>
      </article>
    </section>
  );
}

