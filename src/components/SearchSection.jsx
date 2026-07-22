import React, { useState, useEffect } from 'react';
import { Search, Hash, User, MapPin, BookOpen, Sparkles, AlertCircle, ArrowLeft, CheckCircle, FileSpreadsheet, Database } from 'lucide-react';
import { BRANCHES, GOVERNORATES, searchStudentsAsync } from '../data/studentsData';
import { API_BASE_URL } from '../config';
import AdsterraAd from './AdsterraAd';

export default function SearchSection({ onSelectStudent, customStudents = [], onOpenExcelModal }) {
  const [searchType, setSearchType] = useState('seatNumber'); // 'seatNumber' | 'name'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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

    const matched = await searchStudentsAsync(query, searchType, customStudents);
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
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-4">
          <Sparkles class="w-4 h-4 text-emerald-500" />
          <span>استعلام فوري ومعتمد لنتائج امتحانات الثانوية العامة 2025</span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-snug">
          ابحث عن نتيجتك <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600">برقم الجلوس</span> أو <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500">الاسم</span>
        </h2>
        <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
          أدخل رقم الجلوس أو اسم الطالب للحصول على النتيجة فوراً (المجموع من 320 درجة).
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
                  : 'أدخل اسم الطالب (مثال: أحمد)'
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

          {/* Instant Submit Button */}
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-lg shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSearching ? (
              <>
                <span class="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>جاري البحث...</span>
              </>
            ) : (
              <>
                <Search class="w-6 h-6" />
                <span>عرض النتيجة الآن</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading Indicator during async search */}
      {isSearching && (
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">جاري استدعاء النتيجة المعتمدة...</h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">جاري الاستعلام في قواعد بيانات 810,000 طالب وطالبة</p>
        </div>
      )}

      {/* Results List View (when searching by name or multiple matches) */}
      {hasSearched && !isSearching && (
        <div className="mt-8">
          {results.length === 0 ? (
            <div class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-6 text-center">
              <AlertCircle class="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 class="text-lg font-bold text-amber-900 dark:text-amber-200 mb-1">
                لم يتم العثور على نتيجة مطابقة
              </h3>
              <p class="text-sm text-amber-700 dark:text-amber-400">
                تأكد من كتابة {searchType === 'seatNumber' ? 'رقم الجلوس الصحيح' : 'اسم الطالب بدقة'}.
              </p>
            </div>
          ) : (
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle class="w-5 h-5 text-emerald-600" />
                  <span>نتائج البحث ({results.length})</span>
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
    </section>
  );
}
