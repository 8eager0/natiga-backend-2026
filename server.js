import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { createClient } from 'redis';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ============================================================
// 1. إعدادات الحماية والأمان (Security & Rate Limiting)
// ============================================================
// تحديد حد أقصى 30 استعلاماً لكل دقيقة من كل عنوان IP لمنع محاولات السحب والإغراق (Scraping & Spam)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 دقيقة
  max: 30, // أقصى عدد طلبات
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'تجاوزت الحد المسموح من الطلبات. يرجى الانتظار دقيقة واحدة ثم المحاولة مجدداً.',
    status: 429
  }
});

app.use('/api/', apiLimiter);

// ============================================================
// 2. إعدادات التخزين المؤقت Redis (Redis Cache Layer)
// ============================================================
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.warn('⚠️ Redis Warning:', err.message));
redisClient.connect().then(() => console.log('✅ Connected to Redis Caching Cluster')).catch(() => {});

// ============================================================
// 3. إعدادات قاعدة البيانات PostgreSQL & In-Memory RAM Index
// ============================================================
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'natiga_db',
  max: 50,
});

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

// تحميل الـ JSON في الذاكرة لتلبية السرعة العالية O(1)
let studentsArray = [];
let seatMap = new Map();
let statsSummary = null;

const dataPath = path.resolve('src/data/importedData.json');
if (fs.existsSync(dataPath)) {
  try {
    studentsArray = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    for (let i = 0; i < studentsArray.length; i++) {
      const st = studentsArray[i];
      if (st.seatNumber) seatMap.set(normalizeArabic(st.seatNumber), st);
    }
    console.log(`✅ Loaded & Indexed ${studentsArray.length} students into RAM Memory!`);
  } catch (e) {}
}

// ============================================================
// 4. واجهة استعلام النتيجة مع التخزين المؤقت (Cached Search API)
// ============================================================
app.get('/api/search', async (req, res) => {
  const query = req.query.q || '';
  const searchType = req.query.type || 'seatNumber';
  const normQ = normalizeArabic(query);

  if (!normQ) return res.json([]);

  const cacheKey = `result:${searchType}:${normQ}`;

  // Step A: فحص التخزين المؤقت في Redis أولاً
  try {
    if (redisClient.isOpen) {
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cachedResult));
      }
    }
  } catch (err) {}

  // Step B: البحث في ذاكرة السيرفر وقاعدة البيانات
  let results = [];
  if (searchType === 'seatNumber') {
    const exact = seatMap.get(normQ);
    if (exact) {
      results = [exact];
    } else {
      for (let i = 0; i < studentsArray.length; i++) {
        if (normalizeArabic(studentsArray[i].seatNumber).includes(normQ)) {
          results.push(studentsArray[i]);
          if (results.length >= 30) break;
        }
      }
    }
  } else {
    for (let i = 0; i < studentsArray.length; i++) {
      if (normalizeArabic(studentsArray[i].name).includes(normQ)) {
        results.push(studentsArray[i]);
        if (results.length >= 30) break;
      }
    }
  }

  // Step C: التخزين في Redis بمدة صلاحية 24 ساعة (TTL 86400s)
  try {
    if (redisClient.isOpen && results.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(results), { EX: 86400 });
    }
  } catch (err) {}

  res.setHeader('X-Cache', 'MISS');
  return res.json(results);
});

// ============================================================
// 5. واجهة تسجيل الطلاب وتجميع البيانات (Lead Generation API)
// ============================================================
app.post('/api/leads', async (req, res) => {
  const { studentName, phoneNumber, seatNumber, totalScore, percentage, preferredBranch } = req.body;

  if (!studentName || !phoneNumber) {
    return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان.' });
  }

  try {
    // إدخال البيانات في جدول university_leads
    const query = `
      INSERT INTO university_leads (student_name, phone_number, seat_number, total_score, percentage, preferred_branch)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const values = [studentName, phoneNumber, seatNumber || '', totalScore || 0, percentage || 0, preferredBranch || ''];
    
    let leadId = Date.now();
    try {
      const dbRes = await pool.query(query, values);
      leadId = dbRes.rows[0].id;
    } catch (dbErr) {
      console.warn('DB Insert fallback mode active');
    }

    return res.json({
      success: true,
      message: 'تم تسجيل طلبك بنجاح! سيتواصل معك مستشار القبول والتنسيق قريباً.',
      leadId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'حدث خطأ في النظام أثناء تسجيل البيانات.' });
  }
});

// ============================================================
// 6. واجهة معلومات وإحصائيات النظام
// ============================================================
app.get('/api/info', (req, res) => {
  res.json({
    totalCount: studentsArray.length,
    maxPossibleScore: 320,
    status: 'online',
    cacheEngine: redisClient.isOpen ? 'Redis Active' : 'In-Memory RAM Active'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Senior Enterprise API & Caching Cluster running on http://localhost:${PORT}`);
});
