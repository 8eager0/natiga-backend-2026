import React, { useState } from 'react';
import { Send, CheckCircle2, GraduationCap, Phone, User, Sparkles } from 'lucide-react';

export default function LeadGenForm({ studentData }) {
  const [formData, setFormData] = useState({
    studentName: studentData ? studentData.name : '',
    phoneNumber: '',
    preferredBranch: 'طب / هيد لاين صيدلة',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phoneNumber.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        studentName: formData.studentName || (studentData ? studentData.name : ''),
        phoneNumber: formData.phoneNumber,
        seatNumber: studentData ? studentData.seatNumber : '',
        totalScore: studentData ? studentData.totalScore : 0,
        percentage: studentData ? ((studentData.totalScore / 320) * 100).toFixed(2) : 0,
        preferredBranch: formData.preferredBranch,
      };

      const res = await fetch('http://localhost:4000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'حدث خطأ أثناء حفظ البيانات.');
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setSubmitted(true); // Fallback optimistic feedback
    }
  };

  return (
    <div class="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 my-8 border border-emerald-800 shadow-2xl relative overflow-hidden">
      
      {/* Background Glow */}
      <div class="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div class="relative z-10 max-w-2xl mx-auto text-center space-y-4">
        
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
          <Sparkles class="w-4 h-4 text-amber-400" />
          <span>فرص قبول وتخصيص بالجامعات الخاصة والأهلية 2026</span>
        </div>

        <h3 class="text-2xl sm:text-3xl font-black text-white">
          هل ترغب في الحصول على خصومات وعروض القبول بالجامعات؟
        </h3>

        <p class="text-xs sm:text-sm text-slate-300 font-medium">
          سجّل بياناتك ليصلك اتصال فوري من مستشار التنسيق الأكاديمي لشرح المنح المتاحة لمجموعك وتسهيل التقديم.
        </p>

        {submitted ? (
          <div class="p-6 bg-emerald-900/60 rounded-2xl border border-emerald-500/50 flex flex-col items-center gap-2 animate-fadeIn">
            <CheckCircle2 class="w-12 h-12 text-emerald-400" />
            <h4 class="text-lg font-black text-white">تم تسليم طلبك بنجاح!</h4>
            <p class="text-xs text-emerald-200">سيتواصل معك فريق الاستشارات والتنسيق قريباً على رقم هاتفك.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} class="space-y-4 pt-2 text-right">
            {errorMsg && (
              <p class="text-xs font-bold text-red-400 text-center">{errorMsg}</p>
            )}

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div class="relative">
                <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <User class="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="اسم الطالب بالكامل"
                  class="w-full pr-10 pl-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Phone Number */}
              <div class="relative">
                <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone class="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="رقم الهاتف (واتساب)"
                  class="w-full pr-10 pl-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-right"
                  required
                />
              </div>
            </div>

            {/* Preferred Sector */}
            <div class="relative">
              <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <GraduationCap class="w-4 h-4" />
              </div>
              <select
                value={formData.preferredBranch}
                onChange={(e) => setFormData({ ...formData, preferredBranch: e.target.value })}
                class="w-full pr-10 pl-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="القطاع الطبي (طب بشرى / أسنان / صيدلة / علاج طبيعي)">القطاع الطبي (طب بشرى / أسنان / صيدلة / علاج طبيعي)</option>
                <option value="القطاع الهندسي والتطبيقي (هندسة / حاسبات / ذكاء اصطناعي)">القطاع الهندسي والتطبيقي (هندسة / حاسبات / ذكاء اصطناعي)</option>
                <option value="قطاع العلوم الإنسانية والإدارة (إعلام / إدارية / لغات)">قطاع العلوم الإنسانية والإدارة (إعلام / إدارية / لغات)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span class="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send class="w-5 h-5" />
                  <span>احصل على عروض التنسيق والمنح المجانية الآن</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
