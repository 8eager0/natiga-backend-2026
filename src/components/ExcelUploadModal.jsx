import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Trash2, Eye } from 'lucide-react';
import { normalizeArabic } from '../data/studentsData';

export default function ExcelUploadModal({ isOpen, onClose, onImportSuccess, onClearData, currentCount }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg('');
    setSuccessInfo(null);
    setPreviewRows([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Read first sheet as 2D matrix
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (matrix.length === 0) {
          setErrorMsg('الملف المرفوع فارغ أو لا يحتوي على صفوف بيانات.');
          setIsProcessing(false);
          return;
        }

        // Find header row index by scanning first 15 rows for keywords
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(matrix.length, 15); i++) {
          const rowStr = matrix[i].map(c => normalizeArabic(c)).join(' ');
          if (rowStr.includes('جلوس') || rowStr.includes('اسم') || rowStr.includes('مجموع') || rowStr.includes('seat')) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = matrix[headerRowIndex].map(h => String(h).trim());
        const dataRows = matrix.slice(headerRowIndex + 1).filter(row => row.some(cell => cell !== '' && cell !== null));

        if (dataRows.length === 0) {
          setErrorMsg('لم يتم العثور على صفوف بيانات بعد الترويسة في ملف Excel.');
          setIsProcessing(false);
          return;
        }

        const findColIndex = (possibleNames) => {
          return headers.findIndex(h => {
            const normH = normalizeArabic(h);
            return possibleNames.some(p => normH.includes(normalizeArabic(p)));
          });
        };

        let seatColIndex = findColIndex(['جلوس', 'رقم الجلوس', 'رقم_الجلوس', 'seat', 'seat_number', 'id', 'رقم']);
        let nameColIndex = findColIndex(['اسم', 'اسم الطالب', 'الطالب', 'name', 'student_name']);
        let totalColIndex = findColIndex(['مجموع', 'المجموع', 'المجموع الكلي', 'المجموع_الكلي', 'درجة', 'total', 'score', 'degree']);
        let branchColIndex = findColIndex(['شعبة', 'الشعبة', 'فرع', 'branch']);
        let govColIndex = findColIndex(['محافظة', 'المحافظة', 'governorate']);

        // Smart fallback value scanner if headers were non-standard
        if (seatColIndex === -1 || nameColIndex === -1 || totalColIndex === -1) {
          const sampleRow = dataRows[0];
          sampleRow.forEach((cellVal, colIdx) => {
            const strVal = String(cellVal).trim();
            const normVal = normalizeArabic(strVal);

            if (seatColIndex === -1 && /^\d{4,9}$/.test(normVal)) {
              seatColIndex = colIdx;
            } else if (nameColIndex === -1 && /[أ-ي]/.test(strVal) && strVal.includes(' ')) {
              nameColIndex = colIdx;
            } else if (totalColIndex === -1 && !isNaN(parseFloat(strVal)) && parseFloat(strVal) >= 30 && parseFloat(strVal) <= 320) {
              totalColIndex = colIdx;
            }
          });
        }

        // Fallbacks if still not found
        if (seatColIndex === -1) seatColIndex = 0;
        if (nameColIndex === -1) nameColIndex = 1;
        if (totalColIndex === -1) totalColIndex = Math.min(2, headers.length - 1);

        const importedStudents = dataRows.map((row, idx) => {
          const rawSeat = row[seatColIndex] !== undefined ? String(row[seatColIndex]) : String(100000 + idx);
          const seat = normalizeArabic(rawSeat);
          
          const rawName = row[nameColIndex] !== undefined ? String(row[nameColIndex]).trim() : `طالب ${idx + 1}`;
          const name = rawName || `طالب ${idx + 1}`;

          const branch = branchColIndex !== -1 && row[branchColIndex] ? String(row[branchColIndex]).trim() : 'عام';
          const gov = govColIndex !== -1 && row[govColIndex] ? String(row[govColIndex]).trim() : 'جمهورية مصر العربية';

          const totalRaw = totalColIndex !== -1 && row[totalColIndex] !== undefined ? String(row[totalColIndex]).replace(/,/g, '.') : '0';
          let totalScore = parseFloat(totalRaw) || 0;

          const percentage = Number(((totalScore / 320) * 100).toFixed(2));
          const status = percentage >= 50 ? 'ناجح' : 'راسب';

          return {
            seatNumber: seat,
            name: name,
            school: 'المدرسة الثانوية العامة',
            directorate: `إدارة التعليم العامة`,
            governorate: gov,
            branch: branch,
            status: status,
            totalScore: totalScore,
            maxPossible: 320,
            subjects: [],
            isUploaded: true
          };
        });

        setIsProcessing(false);
        setSuccessInfo({
          count: importedStudents.length,
          fileName: file.name
        });
        setPreviewRows(importedStudents.slice(0, 3));

        onImportSuccess(importedStudents);

      } catch (err) {
        console.error(err);
        setErrorMsg('حدث خطأ أثناء قراءة ملف Excel. يرجى التأكد من أن الملف بصيغة (.xlsx أو .csv).');
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          class="absolute top-5 left-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl bg-slate-100 dark:bg-slate-800"
        >
          <X class="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div class="text-center mb-6">
          <div class="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet class="w-8 h-8" />
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white">
            رفع ملف النتائج (.xlsx)
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            المجموع الكلي محدد تلقائياً من 320 درجة
          </p>
        </div>

        {/* Success Alert */}
        {successInfo && (
          <div class="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div class="flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-bold">
              <CheckCircle2 class="w-6 h-6 text-emerald-600 shrink-0" />
              <span>تم تحليل وقراءة {successInfo.count} طالب بنجاح! ({successInfo.fileName})</span>
            </div>

            {/* Preview of Parsed Rows */}
            {previewRows.length > 0 && (
              <div class="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 text-xs">
                <p class="font-extrabold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-1">
                  <Eye class="w-3.5 h-3.5" /> معاينة من البيانات المقروءة (من 320):
                </p>
                <div class="space-y-1 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700">
                  {previewRows.map((st, i) => (
                    <div key={i} class="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>رقم الجلوس: <strong class="text-emerald-600">{st.seatNumber}</strong></span>
                      <span>الاسم: {st.name}</span>
                      <span>المجموع: {st.totalScore}/320</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div class="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-800 dark:text-red-300 text-sm font-bold">
            <AlertCircle class="w-6 h-6 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* File Dropzone */}
        <label class="border-2 border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all text-center group mb-4">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            disabled={isProcessing}
            class="hidden"
          />

          <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
            <Upload class="w-6 h-6" />
          </div>

          <span class="font-extrabold text-slate-800 dark:text-slate-200 text-base mb-1">
            اضغط هنا لاختيار ملف Excel (.xlsx)
          </span>
          <span class="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full mt-1">
            ✓ احتساب النسبة المئوية تلقائياً من 320 درجة
          </span>
        </label>

        {/* Clear Data Button */}
        {currentCount > 0 && (
          <div class="mb-4 flex items-center justify-between p-3.5 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/60">
            <span class="text-xs font-bold text-red-800 dark:text-red-300">
              يوجد حالياً {currentCount} طالب محمل.
            </span>
            <button
              onClick={() => {
                onClearData();
                setSuccessInfo(null);
                setPreviewRows([]);
              }}
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>حذف الشيت لتغييره</span>
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div class="flex justify-end">
          <button
            onClick={onClose}
            class="px-5 py-2.5 rounded-xl font-extrabold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md"
          >
            تم / إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
