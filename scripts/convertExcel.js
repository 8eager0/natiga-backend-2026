import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const normalizeArabic = (text) => {
  if (text === null || text === undefined) return '';
  const str = String(text).trim();
  const convertedDigits = str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  return convertedDigits
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, '')
    .toLowerCase();
};

const excelPath = path.resolve('d:/natiga', 'نتيجة الثانوية العامة 2025.xlsx');
console.log('Reading file:', excelPath);

if (!fs.existsSync(excelPath)) {
  console.error('File not found at:', excelPath);
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('Converting sheet to matrix...');
const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log(`Matrix has ${matrix.length} rows.`);

let headerRowIndex = 0;
for (let i = 0; i < Math.min(matrix.length, 20); i++) {
  const rowStr = matrix[i].map(c => normalizeArabic(c)).join(' ');
  if (rowStr.includes('جلوس') || rowStr.includes('اسم') || rowStr.includes('مجموع') || rowStr.includes('seat')) {
    headerRowIndex = i;
    break;
  }
}

const headers = matrix[headerRowIndex].map(h => String(h).trim());
console.log('Detected headers:', headers);

const dataRows = matrix.slice(headerRowIndex + 1).filter(row => row.some(cell => cell !== '' && cell !== null));
console.log(`Found ${dataRows.length} student data rows.`);

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
let schoolColIndex = findColIndex(['مدرسة', 'المدرسة', 'school']);

if (seatColIndex === -1 || nameColIndex === -1 || totalColIndex === -1) {
  const sampleRow = dataRows[0];
  sampleRow.forEach((cellVal, colIdx) => {
    const strVal = String(cellVal).trim();
    const normVal = normalizeArabic(strVal);

    if (seatColIndex === -1 && /^\d{4,9}$/.test(normVal)) seatColIndex = colIdx;
    else if (nameColIndex === -1 && /[أ-ي]/.test(strVal) && strVal.includes(' ')) nameColIndex = colIdx;
    else if (totalColIndex === -1 && !isNaN(parseFloat(strVal)) && parseFloat(strVal) >= 20 && parseFloat(strVal) <= 320) totalColIndex = colIdx;
  });
}

if (seatColIndex === -1) seatColIndex = 0;
if (nameColIndex === -1) nameColIndex = 1;
if (totalColIndex === -1) totalColIndex = Math.min(2, headers.length - 1);

console.log(`Mapping columns -> Seat: [${seatColIndex}] ${headers[seatColIndex]}, Name: [${nameColIndex}] ${headers[nameColIndex]}, Total: [${totalColIndex}] ${headers[totalColIndex]}`);

const students = dataRows.map((row, idx) => {
  const rawSeat = row[seatColIndex] !== undefined ? String(row[seatColIndex]) : String(100000 + idx);
  const seat = normalizeArabic(rawSeat);

  const rawName = row[nameColIndex] !== undefined ? String(row[nameColIndex]).trim() : `طالب ${idx + 1}`;
  const name = rawName || `طالب ${idx + 1}`;

  const branch = branchColIndex !== -1 && row[branchColIndex] ? String(row[branchColIndex]).trim() : 'عام';
  const gov = govColIndex !== -1 && row[govColIndex] ? String(row[govColIndex]).trim() : 'جمهورية مصر العربية';
  const school = schoolColIndex !== -1 && row[schoolColIndex] ? String(row[schoolColIndex]).trim() : 'المدرسة الثانوية العامة';

  const totalRaw = totalColIndex !== -1 && row[totalColIndex] !== undefined ? String(row[totalColIndex]).replace(/,/g, '.') : '0';
  let totalScore = parseFloat(totalRaw) || 0;

  const percentage = Number(((totalScore / 320) * 100).toFixed(2));
  const status = percentage >= 50 ? 'ناجح' : 'راسب';

  return {
    seatNumber: seat,
    name: name,
    school: school,
    directorate: 'إدارة التعليم العامة',
    governorate: gov,
    branch: branch,
    status: status,
    totalScore: totalScore,
    maxPossible: 320,
    subjects: []
  };
});

const outputPath = path.resolve('d:/natiga/src/data', 'importedData.json');
fs.writeFileSync(outputPath, JSON.stringify(students), 'utf-8');
console.log(`Successfully written ${students.length} students to ${outputPath}`);
