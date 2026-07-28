import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { DatabaseSync } from 'node:sqlite';

const dbPath = path.resolve('database/natiga.sqlite');

// التأكد من وجود مجلد database
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('⚡ بدء إنشاء وتشغيل قاعدة البيانات المحلية فائقة السرعة (SQLite Local Engine)...');

// 1. تحويل الأرقام العربية إلى إنجليزية
function normalizeDigits(text) {
  if (!text) return '';
  const str = String(text).trim();
  return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

// 2. تقسيم سطر CSV
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

// 3. كشف مكان ملف الـ CSV إذا كان موجوداً
function findCsvFile() {
  const priorityPaths = [
    'data/students.csv',
    'src/data/students.csv',
    'data/نتيجة الثانوية العامة 2025.csv',
    'نتيجة الثانوية العامة 2025.csv'
  ];

  for (const p of priorityPaths) {
    if (fs.existsSync(p)) return path.resolve(p);
  }

  if (fs.existsSync('data')) {
    const dataFiles = fs.readdirSync('data').filter(f => f.toLowerCase().endsWith('.csv'));
    if (dataFiles.length > 0) return path.resolve('data', dataFiles[0]);
  }

  const rootFiles = fs.readdirSync('.').filter(f => f.toLowerCase().endsWith('.csv'));
  if (rootFiles.length > 0) return path.resolve(rootFiles[0]);

  return null;
}

export async function buildDatabase() {
  const csvFile = findCsvFile();
  if (!csvFile) {
    console.warn('⚠️ لم يتم العثور على أي ملف بيانات CSV.');
    return;
  }

  console.log(`📖 تم العثور على ملف النتيجة CSV: ${path.basename(csvFile)}`);
  console.log('⏳ جاري قراءة وتغذية قاعدة بيانات SQLite بالتدفق المباشر (Zero-RAM Stream)...');

  const db = new DatabaseSync(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    
    DROP TABLE IF EXISTS students;

    CREATE TABLE IF NOT EXISTS students (
      seat_number TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      total_score REAL NOT NULL,
      percentage REAL NOT NULL,
      status TEXT NOT NULL,
      branch TEXT,
      governorate TEXT,
      school TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
    CREATE INDEX IF NOT EXISTS idx_students_percentage ON students(percentage);
  `);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO students (seat_number, name, total_score, percentage, status, branch, governorate, school)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');

  const fileStream = fs.createReadStream(csvFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let headers = null;
  let colIndexes = { seatNumber: 0, name: 1, totalScore: 2, percentage: -1, branch: -1, governorate: -1, school: -1, status: -1 };
  let count = 0;

  for await (const line of rl) {
    if (!line || !line.trim()) continue;

    if (!headers) {
      headers = parseCsvLine(line).map(h => h.toLowerCase().trim());
      headers.forEach((h, idx) => {
        if (h.includes('جلوس') || h.includes('seat')) colIndexes.seatNumber = idx;
        else if (h.includes('اسم') || h.includes('name')) colIndexes.name = idx;
        else if (h.includes('مجموع') || h.includes('score') || h.includes('درجة') || h.includes('degree') || h.includes('total')) colIndexes.totalScore = idx;
        else if (h.includes('نسبة') || h.includes('percent')) colIndexes.percentage = idx;
        else if (h.includes('شعبة') || h.includes('تخصص') || h.includes('branch')) colIndexes.branch = idx;
        else if (h.includes('محافظة') || h.includes('gov')) colIndexes.governorate = idx;
        else if (h.includes('مدرسة') || h.includes('school')) colIndexes.school = idx;
        else if (h.includes('حالة') || h.includes('case') || h.includes('status')) colIndexes.status = idx;
      });
      continue;
    }

    const row = parseCsvLine(line);
    const seatNumber = normalizeDigits(row[colIndexes.seatNumber] || '');
    const name = row[colIndexes.name] || '';

    if (!seatNumber || !name) continue;

    const totalScore = Number(normalizeDigits(row[colIndexes.totalScore])) || 0;
    let percentage = colIndexes.percentage !== -1 ? Number(normalizeDigits(row[colIndexes.percentage])) : 0;
    if (!percentage && totalScore > 0) {
      percentage = Number(((totalScore / 320) * 100).toFixed(2));
    }

    const branch = colIndexes.branch !== -1 ? row[colIndexes.branch] : 'عامة';
    const governorate = colIndexes.governorate !== -1 ? row[colIndexes.governorate] : 'جمهورية مصر العربية';
    const school = colIndexes.school !== -1 ? row[colIndexes.school] : 'المدرسة الثانوية العامة';
    const status = colIndexes.status !== -1 ? row[colIndexes.status] : (percentage >= 50 ? 'ناجح' : 'راسب');

    insertStmt.run(
      String(seatNumber),
      String(name),
      totalScore,
      percentage,
      String(status),
      String(branch),
      String(governorate),
      String(school)
    );
    count++;
  }

  db.exec('COMMIT');

  console.log(`🎉 تم بنجاح بناء قاعدة البيانات المحلية SQLite! عدد الطلاب: ${count.toLocaleString('ar-EG')}`);
  db.close();
}

if (process.argv[1] && process.argv[1].endsWith('buildSqliteDb.js')) {
  buildDatabase().catch(err => {
    console.error('❌ خطأ في بناء قاعدة البيانات المحلية:', err);
    process.exit(1);
  });
}
