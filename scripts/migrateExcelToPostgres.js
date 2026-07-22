/**
 * سكريبت معالجة ونقل بيانات ملف نتائج الثانوية العامة Excel إلى PostgreSQL
 * يضمن سرعة إدخال البينات باستخدام الحزم (Batch Insert Chunking)
 */
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import pkg from 'pg';
const { Pool } = pkg;

// إعدادات الاتصال بقاعدة البيانات PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'natiga_db',
  max: 20, // أقصى عدد للروابط المتزامنة
  idleTimeoutMillis: 30000,
});

// دالة تطهير ومعالجة النصوص والأرقام العربية
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

async function migrateExcelToPostgres() {
  const filePath = path.resolve('d:/natiga', 'نتيجة الثانوية العامة 2025.xlsx');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ لم يتم العثور على الملف في المسار: ${filePath}`);
    process.exit(1);
  }

  console.log(`⚡ بدء قراءة ملف Excel بحجم كبير: ${filePath}...`);
  const workbook = XLSX.readFile(filePath, { dense: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  console.log(`📊 إجمالي عدد الصفوف المقروءة: ${matrix.length}`);

  // تحديد صف الترويسة
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(matrix.length, 20); i++) {
    const rowStr = matrix[i].map(c => normalizeArabic(c)).join(' ');
    if (rowStr.includes('جلوس') || rowStr.includes('اسم') || rowStr.includes('مجموع') || rowStr.includes('seating')) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = matrix[headerRowIndex].map(h => String(h).trim());
  const dataRows = matrix.slice(headerRowIndex + 1).filter(row => row.some(cell => cell !== '' && cell !== null));

  console.log(`✅ تم التعرف على الترويسة عند الصف ${headerRowIndex + 1}. عدد الطلاب: ${dataRows.length}`);

  const findCol = (keys) => headers.findIndex(h => keys.some(k => normalizeArabic(h).includes(normalizeArabic(k))));

  const seatCol = findCol(['جلوس', 'seating_no', 'seat']);
  const nameCol = findCol(['اسم', 'arabic_name', 'name']);
  const totalCol = findCol(['مجموع', 'total_degree', 'degree']);

  const BATCH_SIZE = 5000;
  let processedCount = 0;
  const client = await pool.connect();

  try {
    console.log('⚡ إدخال البيانات إلى PostgreSQL باستخدام الحزم (Batch Inserts)...');
    await client.query('BEGIN');

    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
      const chunk = dataRows.slice(i, i + BATCH_SIZE);
      const valueTuples = [];
      const queryValues = [];
      let paramIndex = 1;

      for (const row of chunk) {
        const seat = normalizeArabic(row[seatCol] || (100000 + i));
        const name = String(row[nameCol] || '').trim();
        const normName = normalizeArabic(name);
        const total = parseFloat(String(row[totalCol]).replace(/,/g, '.')) || 0;
        const percentage = Number(((total / 320) * 100).toFixed(2));
        const status = percentage >= 50 ? 'ناجح' : 'راسب';

        valueTuples.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5})`);
        queryValues.push(seat, name, normName, total, percentage, status);
        paramIndex += 6;
      }

      const insertQuery = `
        INSERT INTO students (seat_number, name, normalized_name, total_score, percentage, status)
        VALUES ${valueTuples.join(', ')}
        ON CONFLICT (seat_number) DO UPDATE SET
          name = EXCLUDED.name,
          normalized_name = EXCLUDED.normalized_name,
          total_score = EXCLUDED.total_score,
          percentage = EXCLUDED.percentage,
          status = EXCLUDED.status;
      `;

      await client.query(insertQuery, queryValues);
      processedCount += chunk.length;
      console.log(`⏳ تم إدخال ${processedCount} / ${dataRows.length} طالب...`);
    }

    await client.query('COMMIT');
    console.log(`🎉 تمت عملية الهجرة بنجاح! إجمالي البيانات المخزنة: ${processedCount}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ حدث خطأ أثناء إدخال البيانات:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateExcelToPostgres();
