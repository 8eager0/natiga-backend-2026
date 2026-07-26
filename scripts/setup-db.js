import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال بقاعدة البيانات المحثوثة (Managed PostgreSQL)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/natiga_db';

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function setupDatabase() {
  console.log('⚡ بدء تهيئة فهارس قاعدة البيانات المدارة (PostgreSQL Database Setup)...');
  const client = await pool.connect();
  
  try {
    // 1. تفعيل إضافة pg_trgm للبحث السريع بالاسم
    console.log('1️⃣ تفعيل إضافة pg_trgm لعمليات البحث النصي العربي...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // 2. إنشاء جدول الطلاب إذا لم يكن موجوداً
    console.log('2️⃣ التأكد من وجود جدول الطلاب (students)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        seat_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        total_score NUMERIC(5,2),
        percentage NUMERIC(5,2),
        school_name VARCHAR(255),
        governorate VARCHAR(100),
        academic_branch VARCHAR(100),
        status VARCHAR(50) DEFAULT 'ناجح',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. إنشاء فهرس B-Tree لرقم الجلوس (البحث السريع O(log N))
    console.log('3️⃣ إنشاء فهرس B-Tree لرقم الجلوس (idx_students_seat_number)...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_students_seat_number 
      ON students(seat_number);
    `);

    // 4. إنشاء فهرس GIN Trigram للبحث الجزئي بالاسم العربي
    console.log('4️⃣ إنشاء فهرس GIN للبحث بالاسم العربي (idx_students_name_trgm)...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_students_name_trgm 
      ON students USING gin (name gin_trgm_ops);
    `);

    // 5. إنشاء فهرس المجموع التراكمي للتصفية السريعة
    console.log('5️⃣ إنشاء فهرس المجموع التراكمي (idx_students_total_score)...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_students_total_score 
      ON students (total_score DESC);
    `);

    // 6. تحديث إحصائيات الاستعلامات لدى Query Planner
    console.log('6️⃣ تحديث إحصائيات قاعدة البيانات (ANALYZE)...');
    await client.query(`ANALYZE students;`);

    console.log('✅ تم إنشاء وتفعيل جميع الفهارس بنجاح 100%! قاعدة البيانات جاهزة الآن لمعالجة الطلبات العالية.');
  } catch (err) {
    console.error('❌ حدث خطأ أثناء تنفيذ الفهرسة:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
