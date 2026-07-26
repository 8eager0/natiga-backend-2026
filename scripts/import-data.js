import dns from 'node:dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import pkg from 'pg';
const { Pool } = pkg;

// إجبار مكتبة pg ونظام DNS على استخدام شبكة IPv4 فقط لمنع خطأ ENETUNREACH في منصة Render
pkg.defaults.family = 4;

// 1. الاتصال بقاعدة البيانات المدارة (PostgreSQL Database Connection)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/natiga_db';

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: connectionString && !connectionString.includes('localhost')
    ? { rejectUnauthorized: false }
    : false,
});

// 2. البحث التلقائي عن ملف الـ CSV في مجلد data أو المجلد الرئيسي
function findCsvFile() {
  const argFile = process.argv[2];
  if (argFile && fs.existsSync(argFile)) {
    return path.resolve(argFile);
  }

  const priorityPaths = [
    'data/students.csv',
    'src/data/students.csv',
    'data/نتيجة الثانوية العامة 2025.csv',
    'نتيجة الثانوية العامة 2025.csv'
  ];

  for (const p of priorityPaths) {
    if (fs.existsSync(p)) {
      return path.resolve(p);
    }
  }

  // البحث في مجلد data إن وجد
  if (fs.existsSync('data')) {
    const dataFiles = fs.readdirSync('data').filter(f => f.toLowerCase().endsWith('.csv'));
    if (dataFiles.length > 0) {
      return path.resolve('data', dataFiles[0]);
    }
  }

  // البحث في المجلد الرئيسي
  const rootFiles = fs.readdirSync('.').filter(f => f.toLowerCase().endsWith('.csv'));
  if (rootFiles.length > 0) {
    return path.resolve(rootFiles[0]);
  }

  return null;
}

// 3. تطبيع وتحويل الأرقام العربية إلى إنجليزية
function normalizeDigits(text) {
  if (!text) return '';
  const str = String(text).trim();
  return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

// 4. تقسيم سطر CSV مع احترام الفواصل والاقتباسات
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

// 5. السكربت الرئيسي للإدخال التدفق السريع (Streamed Batch Inserter)
async function importCsvData() {
  const csvFilePath = findCsvFile();

  if (!csvFilePath) {
    console.error('❌ لم يتم العثور على أي ملف CSV في المجلد الرئيسي. يرجى وضع ملف النتيجة (مثلاً students.csv) في المجلد ثم المحاولة مجدداً.');
    process.exit(1);
  }

  console.log(`🚀 بدء معالجة ورفع بيانات الملف: ${path.basename(csvFilePath)}`);
  console.log(`⚡ نظام المعالجة: Stream Batch Insertion (5,000 سجل في كل دفعة)...`);

  const startTime = Date.now();
  const fileStream = fs.createReadStream(csvFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let headers = null;
  let colIndexes = {
    seatNumber: -1,
    name: -1,
    totalScore: -1,
    percentage: -1,
    branch: -1,
    governorate: -1,
    school: -1,
    status: -1
  };

  const BATCH_SIZE = 5000;
  let currentBatch = [];
  let totalProcessed = 0;
  let totalInserted = 0;

  for await (const line of rl) {
    if (!line || !line.trim()) continue;

    // السطر الأول: ترويسة الأعمدة (Header Row)
    if (!headers) {
      headers = parseCsvLine(line).map(h => h.toLowerCase().trim());
      console.log('📌 الأعمدة المكتشفة في الملف:', headers.join(' | '));

      headers.forEach((h, idx) => {
        if (h.includes('جلوس') || h.includes('seat')) colIndexes.seatNumber = idx;
        else if (h.includes('اسم') || h.includes('name')) colIndexes.name = idx;
        else if (h.includes('مجموع') || h.includes('score') || h.includes('درجة')) colIndexes.totalScore = idx;
        else if (h.includes('نسبة') || h.includes('percent')) colIndexes.percentage = idx;
        else if (h.includes('شعبة') || h.includes('تخصص') || h.includes('branch')) colIndexes.branch = idx;
        else if (h.includes('محافظة') || h.includes('gov')) colIndexes.governorate = idx;
        else if (h.includes('مدرسة') || h.includes('school')) colIndexes.school = idx;
        else if (h.includes('حالة') || h.includes('status')) colIndexes.status = idx;
      });

      // افتراض الترتيب القياسي إذا لم يتم التعرف على الترويسة
      if (colIndexes.seatNumber === -1) colIndexes.seatNumber = 0;
      if (colIndexes.name === -1) colIndexes.name = 1;
      if (colIndexes.totalScore === -1) colIndexes.totalScore = 2;

      continue;
    }

    // قراءة البيانات من السطر
    const row = parseCsvLine(line);
    const rawSeat = row[colIndexes.seatNumber] || '';
    const seatNumber = normalizeDigits(rawSeat);
    const name = row[colIndexes.name] || 'طالب';
    
    if (!seatNumber || !name) continue;

    const rawScore = Number(normalizeDigits(row[colIndexes.totalScore])) || 0;
    let percentage = colIndexes.percentage !== -1 ? Number(normalizeDigits(row[colIndexes.percentage])) : 0;
    if (!percentage && rawScore > 0) {
      percentage = Number(((rawScore / 320) * 100).toFixed(2));
    }

    const branch = colIndexes.branch !== -1 ? row[colIndexes.branch] : 'عامة';
    const governorate = colIndexes.governorate !== -1 ? row[colIndexes.governorate] : '';
    const school = colIndexes.school !== -1 ? row[colIndexes.school] : '';
    const status = colIndexes.status !== -1 ? row[colIndexes.status] : (percentage >= 50 ? 'ناجح' : 'راسب');

    currentBatch.push([seatNumber, name, rawScore, percentage, school, governorate, branch, status]);
    totalProcessed++;

    // عند اكتمال الدفعة (5,000 سجل)، يتم الإدخال المباشر في قاعدة البيانات
    if (currentBatch.length >= BATCH_SIZE) {
      rl.pause(); // إيقاف التدفق لحين اكتمال عملية الدفعة لتجنب تضخم الذاكرة
      const count = await insertBatch(currentBatch);
      totalInserted += count;
      console.log(`📦 تم رفع دفعة جديدة: ${totalInserted.toLocaleString('ar')} / ${totalProcessed.toLocaleString('ar')} طالب (الذاكرة ممتازة)`);
      currentBatch = [];
      rl.resume(); // استئناف التدفق
    }
  }

  // إدخال المتبقي في الدفعة الأخيرة
  if (currentBatch.length > 0) {
    const count = await insertBatch(currentBatch);
    totalInserted += count;
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 اكتمل رفع بيانات الملف بنجاح في ${durationSec} ثانية!`);
  console.log(`📊 إجمالي السجلات المعالجة: ${totalProcessed.toLocaleString('ar')}`);
  console.log(`✅ إجمالي الطلاب المكتمل إدخالهم: ${totalInserted.toLocaleString('ar')}`);
  
  await pool.end();
  process.exit(0);
}

// 6. تنفيذ إدخال الدفعة عبر استعلام SQL واحد متعدد القيم مع تجنب المكرر (ON CONFLICT DO NOTHING)
async function insertBatch(batch) {
  if (batch.length === 0) return 0;
  const client = await pool.connect();

  try {
    const valueTuples = [];
    const params = [];
    let paramIdx = 1;

    for (let i = 0; i < batch.length; i++) {
      const [seat, name, score, pct, school, gov, branch, status] = batch[i];
      valueTuples.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7})`);
      params.push(seat, name, score, pct, school, gov, branch, status);
      paramIdx += 8;
    }

    const query = `
      INSERT INTO students (seat_number, name, total_score, percentage, school_name, governorate, academic_branch, status)
      VALUES ${valueTuples.join(', ')}
      ON CONFLICT (seat_number) DO NOTHING;
    `;

    const res = await client.query(query, params);
    return res.rowCount || 0;
  } catch (err) {
    console.error('❌ خطأ في إدخال الدفعة:', err.message);
    return 0;
  } finally {
    client.release();
  }
}

importCsvData().catch(err => {
  console.error('❌ خطأ غير متوقع:', err);
  process.exit(1);
});
