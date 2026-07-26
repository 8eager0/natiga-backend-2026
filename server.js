import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import cluster from 'node:cluster';
import os from 'node:os';
import NodeCache from 'node-cache';
import pkg from 'pg';
const { Pool } = pkg;

const PORT = process.env.PORT || 3001;

// ============================================================
// 1. تفعيل وضع العناقيد المدمج في Node.js (Render Cluster Engine)
// ============================================================
// يستفيد من جميع النويات (CPU Cores) المتاحة في سيرفر Render
const numCPUs = Math.min(os.cpus().length, 4); // بحد أقصى 4 عمليات آمنة لمنع تضخم الذاكرة

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  console.log(`⚡ Render Master Process running (PID: ${process.pid}). Forking ${numCPUs} Workers...`);

  // تشغيل عملية عاملة لكل نواة معالج
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ Worker ${worker.process.pid} died. Forking replacement worker...`);
    cluster.fork();
  });
} else {
  // كود الخادم المتنفذ داخل كل عملية عاملة (Worker Process)
  const app = express();
  app.set('trust proxy', 1); // الثقة في Proxy منصة Render لقراءة عناوين IP الحقيقية
  app.use(cors());
  app.use(express.json());

  // ============================================================
  // 2. إعداد التخزين المؤقت المحلي الذكي (Node-Cache In-Memory)
  // ============================================================
  // تخزين الاستعلامات في ذاكرة RAM بمدة صلاحية 12 ساعة (43,200 ثانية)
  const memoryCache = new NodeCache({
    stdTTL: 43200, // 12 ساعة
    checkperiod: 600, // تنظيف الذاكرة كل 10 دقائق
    useClones: false, // لزيادة سرعة الأداء واسترجاع المخرجات فوراً
    maxKeys: 10000 // أقصى عدد استعلامات لتجنب تجاوز حد الذاكرة
  });

  // ============================================================
  // 3. إعدادات الحماية والأمان (Security & Rate Limiting)
  // ============================================================
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 دقيقة
    max: 60, // أقصى عدد طلبات لكل IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'تجاوزت الحد المسموح من الطلبات. يرجى الانتظار دقيقة واحدة ثم المحاولة مجدداً.',
      status: 429
    }
  });

  app.use('/api/', apiLimiter);

  // ============================================================
  // 4. إعدادات قاعدة البيانات PostgreSQL
  // ============================================================
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString: connectionString || undefined,
    host: !connectionString ? (process.env.DB_HOST || 'localhost') : undefined,
    port: !connectionString ? (process.env.DB_PORT || 5432) : undefined,
    user: !connectionString ? (process.env.DB_USER || 'postgres') : undefined,
    password: !connectionString ? (process.env.DB_PASSWORD || 'postgres') : undefined,
    database: !connectionString ? (process.env.DB_NAME || 'natiga_db') : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: connectionString && !connectionString.includes('localhost') ? { rejectUnauthorized: false } : false
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

  const dataPath = path.resolve('src/data/importedData.json');
  if (fs.existsSync(dataPath)) {
    try {
      studentsArray = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      for (let i = 0; i < studentsArray.length; i++) {
        const st = studentsArray[i];
        if (st.seatNumber) seatMap.set(normalizeArabic(st.seatNumber), st);
      }
      console.log(`✅ [Worker ${process.pid}] Loaded & Indexed ${studentsArray.length} students into RAM Memory!`);
    } catch (e) {}
  }

  // ============================================================
  // 5. واجهة استعلام النتيجة فائقة السرعة مع التخزين المؤقت
  // ============================================================
  app.get('/api/search', async (req, res) => {
    const query = req.query.q || '';
    const searchType = req.query.type || 'seatNumber';
    const minScoreParam = req.query.minScore;
    const maxScoreParam = req.query.maxScore;
    const minScore = minScoreParam !== undefined && minScoreParam !== '' ? Number(minScoreParam) : null;
    const maxScore = maxScoreParam !== undefined && maxScoreParam !== '' ? Number(maxScoreParam) : null;
    const normQ = normalizeArabic(query);

    if (!normQ && minScore === null && maxScore === null) return res.json([]);

    const cacheKey = `result:${searchType}:${normQ}:${minScore}:${maxScore}`;

    // أ. فحص التخزين المؤقت المحلي (Memory Cache HIT)
    const cachedData = memoryCache.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache-Status', 'HIT-MEMORY');
      return res.json(cachedData);
    }

    // ب. البحث في الفهرس المحلي وقاعدة البيانات
    let results = [];

    // البحث السريع برقم الجلوس المباشر O(1)
    if (searchType === 'seatNumber' && seatMap.has(normQ)) {
      const exactMatch = seatMap.get(normQ);
      const score = Number(exactMatch.totalScore || 0);
      if ((minScore === null || score >= minScore) && (maxScore === null || score <= maxScore)) {
        results.push(exactMatch);
      }
    } else {
      // البحث بالتصفية
      for (let i = 0; i < studentsArray.length; i++) {
        const st = studentsArray[i];
        let matchesQuery = true;
        if (normQ) {
          if (searchType === 'seatNumber') {
            matchesQuery = normalizeArabic(st.seatNumber).includes(normQ);
          } else {
            matchesQuery = normalizeArabic(st.name).includes(normQ);
          }
        }
        if (!matchesQuery) continue;

        const score = Number(st.totalScore || 0);
        if (minScore !== null && score < minScore) continue;
        if (maxScore !== null && score > maxScore) continue;

        results.push(st);
        if (results.length >= 50) break;
      }
    }

    // ج. تخزين النتيجة في كاش الذاكرة
    if (results.length > 0) {
      memoryCache.set(cacheKey, results);
    }

    res.setHeader('X-Cache-Status', 'MISS');
    return res.json(results);
  });

  // ============================================================
  // 6. واجهة تسجيل الطلاب وتجميع البيانات (Lead Generation API)
  // ============================================================
  app.post('/api/leads', async (req, res) => {
    const { studentName, phoneNumber, seatNumber, totalScore, percentage, preferredBranch } = req.body;

    if (!studentName || !phoneNumber) {
      return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان.' });
    }

    try {
      let leadId = Date.now();
      try {
        const dbQuery = `
          INSERT INTO university_leads (student_name, phone_number, seat_number, total_score, percentage, preferred_branch)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id;
        `;
        const values = [studentName, phoneNumber, seatNumber || '', totalScore || 0, percentage || 0, preferredBranch || ''];
        const dbRes = await pool.query(dbQuery, values);
        leadId = dbRes.rows[0].id;
      } catch (dbErr) {
        console.warn('DB Insert fallback active:', dbErr.message);
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
  // 7. واجهة معلومات وإحصائيات النظام
  // ============================================================
  app.get('/api/info', (req, res) => {
    res.json({
      totalCount: studentsArray.length,
      maxPossibleScore: 320,
      status: 'online',
      workerPid: process.pid,
      cacheEngine: 'Node-Cache RAM Active',
      cachedKeysCount: memoryCache.getStats().keys
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 [Worker ${process.pid}] Natiga Backend API running on port ${PORT}`);
  });
}
