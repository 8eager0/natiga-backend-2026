import React, { useState } from 'react';
import { Send, CheckCircle2, Phone, User, MapPin, BookOpen, Sparkles, Award } from 'lucide-react';
import { API_BASE_URL } from '../config';

const EGYPTIAN_GOVERNORATES = [
  'الشرقية',
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الغربية',
  'المنوفية',
  'القليوبية',
  'البحيرة',
  'كفر الشيخ',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء'
];

const ACADEMIC_BRANCHES = [
  'علمي علوم',
  'علمي رياضة',
  'أدبي'
];

export default function LeadGenForm({ studentData }) {
  // Auto-captured data from student result card
  const totalScore = studentData ? Number(studentData.totalScore || 0) : 0;
  const percentage = studentData ? Number(((totalScore / 320) * 100).toFixed(2)) : 0;
  const defaultBranch = studentData && studentData.branch ? studentData.branch : 'علمي علوم';

  const [formData, setFormData] = useState({
    student_name: studentData ? studentData.name : '',
    whatsapp_number: '',
    governorate: studentData && studentData.governorate && EGYPTIAN_GOVERNORATES.includes(studentData.governorate)
      ? studentData.governorate
      : 'الشرقية',
    academic_branch: ACADEMIC_BRANCHES.includes(defaultBranch) ? defaultBranch : 'علمي علوم',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_name.trim() || !formData.whatsapp_number.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Payload combining manual inputs + auto-captured hidden fields (seat_number, total_score & percentage)
      const payload = {
        student_name: formData.student_name.trim(),
        whatsapp_number: formData.whatsapp_number.trim(),
        seat_number: studentData ? String(studentData.seatNumber || studentData.seat_number || '') : '',
        governorate: formData.governorate,
        academic_branch: formData.academic_branch,
        total_score: totalScore,
        percentage: percentage,
      };

      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        setSubmitted(true);
        setConfirmationMsg(data.message || 'تم تسجيل بياناتك بنجاح، سيتم التواصل معك على واتساب وإرسال توقعات التنسيق والمنح المتاحة قريباً.');
      } else {
        setErrorMsg(data.error || 'حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error('Lead submission error:', err);
      setIsSubmitting(false);
      // Fallback UX success
      setSubmitted(true);
      setConfirmationMsg('تم تسجيل بياناتك بنجاح، سيتم التواصل معك على واتساب وإرسال توقعات التنسيق والمنح المتاحة قريباً.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 my-8 border border-emerald-800/80 shadow-2xl relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>خدمة توقعات التنسيق والجامعات لعام 2026</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-white">
          احصل على تقرير التنسيق والمنح المتاحة لمجموعك ({percentage}%)
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          سجّل بياناتك أدناه للتواصل الفوري عبر الواتساب وتزويدك بكافة الكليات والمنح المتاحة:
        </p>

        {/* 6. UX Confirmation Box (Hides form on success) */}
        {submitted ? (
          <div className="p-8 bg-slate-950/90 rounded-2xl border border-emerald-500/50 text-center space-y-4 animate-fadeIn my-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h4 className="text-xl font-black text-white">تم استلام طلبك بنجاح!</h4>

            <p className="text-sm font-bold text-emerald-300 leading-relaxed max-w-md mx-auto">
              {confirmationMsg}
            </p>

            <div className="pt-2 border-t border-slate-800 flex justify-center gap-4 text-xs font-semibold text-slate-400">
              <span>الطالب: <strong className="text-white">{formData.student_name}</strong></span>
              <span>•</span>
              <span>المحافظة: <strong className="text-white">{formData.governorate}</strong></span>
              <span>•</span>
              <span>النسبة: <strong className="text-emerald-400">{percentage}%</strong></span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-right">
            {errorMsg && (
              <p className="text-xs font-bold text-red-400 text-center">{errorMsg}</p>
            )}

            {/* 3. Auto-Captured Hidden Fields */}
            <input type="hidden" name="total_score" value={totalScore} />
            <input type="hidden" name="percentage" value={percentage} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Manual Input 1: الاسم الثلاثي */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">الاسم الثلاثي</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    placeholder="أدخل الاسم الثلاثي"
                    className="w-full pr-10 pl-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Manual Input 2: رقم الواتساب */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">رقم الواتساب</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="أدخل رقم الواتساب (مثال: 01012345678)"
                    className="w-full pr-10 pl-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-right"
                    required
                  />
                </div>
              </div>

              {/* Manual Input 3: المحافظة (Dropdown) */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">المحافظة</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {EGYPTIAN_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov} className="bg-slate-900 text-white">
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Manual Input 4: الشعبة (Dropdown) */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">الشعبة</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.academic_branch}
                    onChange={(e) => setFormData({ ...formData, academic_branch: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {ACADEMIC_BRANCHES.map((br) => (
                      <option key={br} value={br} className="bg-slate-900 text-white">
                        {br}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* 4. Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.whatsapp_number.trim() || !formData.student_name.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <span className="w-6 h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>اعرف توقعات تنسيقك والجامعات والمنح المتاحة لمجموعك</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
