import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import readline from 'readline';
import { DatabaseSync } from 'node:sqlite';

const jsonPath = path.resolve('src/data/importedData.json');
const gzPath = path.resolve('database/students.json.gz');
const dbPath = path.resolve('database/natiga.sqlite');

// التأكد من وجود مجلد database
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// التأكد من وجود مجلد src/data
const dataDir = path.dirname(jsonPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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

async function buildDatabase() {
  let students = [];
  const csvFile = findCsvFile();

  if (csvFile) {
    console.log(`📖 تم العثور على ملف النتيجة CSV: ${path.basename(csvFile)}`);
    console.log('⏳ جاري قراءة وتحويل سجلات الطلاب بالتدفق (Streaming CSV)...');

    const fileStream = fs.createReadStream(csvFile);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let headers = null;
    let colIndexes = { seatNumber: 0, name: 1, totalScore: 2, percentage: -1, branch: -1, governorate: -1, school: -1 };

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
      const status = percentage >= 50 ? 'ناجح' : 'راسب';

      students.push({
        seatNumber,
        name,
        totalScore,
        percentage,
        status,
        branch,
        governorate,
        school
      });
    }

    console.log(`✅ تم قراءة واستخراج ${students.length.toLocaleString('ar-EG')} طالب من ملف CSV!`);

    // حفظ نسخة JSON خفيفة في src/data/importedData.json لسرعة تحميل الـ RAM
    try {
      console.log('💾 حفظ البيانات في src/data/importedData.json لسرعة الوصول في الذاكرة...');
      fs.writeFileSync(jsonPath, JSON.stringify(students, null, 0), 'utf-8');
    } catch (e) {
      console.warn('⚠️ تعذر كتابة importedData.json:', e.message);
    }
  } else if (fs.existsSync(gzPath)) {
    console.log('📖 فك ضغط واستعادة البيانات من database/students.json.gz...');
    const buffer = fs.readFileSync(gzPath);
    const decompressed = zlib.gunzipSync(buffer);
    students = JSON.parse(decompressed.toString('utf-8'));
  } else if (fs.existsSync(jsonPath)) {
    console.log('📖 قراءة البيانات من src/data/importedData.json...');
    students = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } else {
    console.warn('⚠️ لم يتم العثور على أي ملف بيانات (CSV أو JSON أو GZ). ستبقى قاعدة البيانات فارغة لحين إضافة ملف النتيجة.');
    process.exit(0);
  }

  // حذف ملف الـ SQLite القديم لإعادة البناء بنقاء
  if (fs.existsSync(dbPath)) {
    try { fs.unlinkSync(dbPath); } catch (e) {}
  }

  const db = new DatabaseSync(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    
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

  console.log(`📥 إدخال وجدولة ${students.length.toLocaleString('ar-EG')} طالب داخل قاعدة بيانات SQLite المحلية...`);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO students (seat_number, name, total_score, percentage, status, branch, governorate, school)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');

  let count = 0;
  for (const s of students) {
    const totalScore = Number(s.totalScore || 0);
    const percentage = Number(s.percentage || ((totalScore / 320) * 100).toFixed(2));
    const status = s.status || (percentage >= 50 ? 'ناجح' : 'راسب');

    insertStmt.run(
      String(s.seatNumber || ''),
      String(s.name || ''),
      totalScore,
      percentage,
      status,
      String(s.branch || 'عامة'),
      String(s.governorate || 'جمهورية مصر العربية'),
      String(s.school || 'المدرسة الثانوية العامة')
    );
    count++;
  }

  db.exec('COMMIT');

  console.log(`🎉 تم بنجاح بناء وتكفير قاعدة البيانات المحلية SQLite بنسبة 100%! عدد الطلاب الحالي: ${count.toLocaleString('ar-EG')}`);
  db.close();
}

buildDatabase().catch(err => {
  console.error('❌ خطأ في بناء قاعدة البيانات المحلية:', err);
  process.exit(1);
});
