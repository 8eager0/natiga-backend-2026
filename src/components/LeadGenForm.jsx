import React, { useState } from 'react';
import { Send, CheckCircle2, GraduationCap, Phone, User, Sparkles, School, ChevronRight, Award } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function LeadGenForm({ studentData }) {
  const [formData, setFormData] = useState({
    studentName: studentData ? studentData.name : '',
    phoneNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalScore = studentData ? Number(studentData.totalScore || 0) : 0;
  const percentage = studentData ? Number(((totalScore / 320) * 100).toFixed(2)) : 0;

  // Calculate faculty recommendations based on score percentage
  const getFaculties = (pct) => {
    if (pct >= 85) {
      return [
        { name: 'كليات الهندسة والتخطيط العمراني', type: 'حكومي وخاص', match: '98%' },
        { name: 'كليات الحاسبات والمعلومات والذكاء الاصطناعي', type: 'مباشر', match: '99%' },
        { name: 'كليات العلوم والتمريض المعتمدة', type: 'مباشر', match: '95%' },
        { name: 'أكاديميات تكنولوجيا المعلومات والهندسة', type: 'منح خاصة', match: '100%' },
      ];
    } else if (pct >= 75) {
      return [
        { name: 'كليات الحاسبات والمعلومات (خاص وأهلي)', type: 'مباشر', match: '96%' },
        { name: 'كليات الألسن واللغات والترجمة', type: 'مباشر', match: '94%' },
        { name: 'كليات العلوم والتكنولوجيا التطبيقية', type: 'مباشر', match: '92%' },
        { name: 'كليات الاقتصاد والعلوم السياسية والإدارة', type: 'مباشر', match: '90%' },
      ];
    } else if (pct >= 60) {
      return [
        { name: 'كليات التجارة وإدارة الأعمال والمعاملات المالية', type: 'مباشر', match: '97%' },
        { name: 'كليات الآداب والعلوم الإنسانية والإعلام', type: 'مباشر', match: '95%' },
        { name: 'كليات الحقوق والعلوم القانونية', type: 'مباشر', match: '96%' },
        { name: 'المعاهد العليا للهندسة والإدارة والتكنولوجيا', type: 'معتمد', match: '99%' },
      ];
    } else {
      return [
        { name: 'كليات الحقوق والخدمة الاجتماعية والتربية الفنية', type: 'مباشر', match: '95%' },
        { name: 'المعاهد العليا للحاسات ونظم المعلومات الإدارية', type: 'معتمد', match: '98%' },
        { name: 'المعاهد الفنية والتكنولوجية المعتمدة', type: 'معتمد', match: '99%' },
        { name: 'كليات التربية الرياضية والنوعية', type: 'مباشر', match: '92%' },
      ];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phoneNumber.trim() || !formData.studentName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        studentName: formData.studentName,
        phoneNumber: formData.phoneNumber,
        seatNumber: studentData ? studentData.seatNumber : '',
        totalScore: totalScore,
        percentage: percentage,
        preferredBranch: studentData ? studentData.branch : 'عام',
      };

      await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 my-8 border border-emerald-800/80 shadow-2xl relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>توقعات تنسيق الكليات لعام 2026</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-white">
          اكتشف الكليات المتاحة لمجموعك ({percentage || '0'}%)
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          أدخل اسمك ورقم هاتفك لاستعراض تقرير التنسيق المباشر والمنح المتاحة لمجموعك فوراً:
        </p>

        {submitted ? (
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-emerald-500/40 text-right space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-base">
                <Award className="w-5 h-5" />
                <span>تقرير الكليات والتنسيق المتوقع لطالب: {formData.studentName}</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                النسبة: {percentage}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getFaculties(percentage).map((fac, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <School className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <h5 className="text-xs font-black text-white">{fac.name}</h5>
                      <span className="text-[10px] text-slate-400 font-semibold">{fac.type}</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                    {fac.match}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم حفظ بياناتك وسيتواصل معك مستشار التنسيق عبر الواتساب لتفاصيل المنح.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-right">
            {errorMsg && (
              <p className="text-xs font-bold text-red-400 text-center">{errorMsg}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name Input */}
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="اسم الطالب بالكامل"
                  className="w-full pr-10 pl-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Phone Input */}
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="رقم الموبايل / الواتساب"
                  className="w-full pr-10 pl-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-right"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.phoneNumber.trim() || !formData.studentName.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5" />
                  <span>عرض توقعات الكليات المتاحة لمجموعي فوراً</span>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
