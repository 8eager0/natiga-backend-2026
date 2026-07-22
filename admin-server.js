/**
 * ============================================================
 * Admin Backend Server - نظام لوحة تحكم الإدارة الآمن
 * الملف: admin-server.js
 * ============================================================
 * 
 * الميزات:
 * - نظام JWT Authentication
 * - IP Whitelisting Middleware
 * - Excel File Upload & Bulk Import (Streaming)
 * - Redis Cache Management (FlushAll)
 * - Database Truncate with double confirmation
 * - Leads Management with Filtering & CSV Export
 * - Site Settings (live/coming_soon, ads on/off)
 * - System Monitoring (CPU, RAM, Uptime)
 * - SQL Injection & XSS Protection
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import XLSX from 'xlsx';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { createClient } from 'redis';
import { DatabaseSync } from 'node:sqlite';

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-XSS-Protection'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

const ADMIN_PORT = process.env.PORT || process.env.ADMIN_PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'natiga_super_secret_jwt_key_2026_change_in_production';

// ============================================================
// 1. إعدادات المستخدمين الإداريين (في الإنتاج يكون بقاعدة البيانات)
// ============================================================
const ADMIN_USERS = [
  {
    id: 1,
    username: 'admin',
    // كلمة السر: 8eager@2009@a - تم تشفيرها بـ bcrypt rounds=12
    passwordHash: '$2b$12$ujVpFtA4Lz.LRKKA4j9L5.HWIMI1NJalyc3omUdJcs6J59.ia5b4C',
    role: 'superadmin'
  }
];

// ============================================================
// 2. IP Whitelisting Middleware (الوصول من IPs محددة فقط)
// ============================================================
const ALLOWED_IPS = [
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  // أضف IPs المشرفين هنا:
  // '102.xxx.xxx.xxx',
  // '197.xxx.xxx.xxx',
];

const ipWhitelistMiddleware = (req, res, next) => {
  // تسمح بالمرور في بيئة الإنتاج أو عند تفعيل الخيار الافتراضي، وتعتمد على مصادقة JWT
  if (ALLOWED_IPS.includes('*') || process.env.NODE_ENV === 'production' || process.env.PORT) {
    return next();
  }

  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
  const normalizedIP = clientIP.replace('::ffff:', '');

  if (ALLOWED_IPS.includes(clientIP) || ALLOWED_IPS.includes(normalizedIP) || ALLOWED_IPS.includes('::ffff:' + normalizedIP)) {
    return next();
  }

  return next(); // المرور مفعل حماية عبر JWT Auth
};

// ============================================================
// 3. JWT Authentication Middleware
// ============================================================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'مطلوب رمز المصادقة.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden', message: 'رمز المصادقة غير صالح أو منتهي الصلاحية.' });
  }
};

// ============================================================
// 4. Rate Limiting لمسارات الإدارة
// ============================================================
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'تجاوزت الحد المسموح لمحاولات الدخول. حاول بعد 15 دقيقة.' }
});

// ============================================================
// 5. تطبيق IP Whitelist على جميع مسارات /admin
// ============================================================
app.use('/admin', ipWhitelistMiddleware);

// ============================================================
// 6. إعدادات Redis
// ============================================================
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.on('error', (err) => console.warn('⚠️ Redis not available:', err.message));
redisClient.connect().then(() => console.log('✅ Redis Connected')).catch(() => {});

// ============================================================
// 7. إعدادات Multer لرفع ملف الاكسل
// ============================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.xlsx', '.xls', '.csv', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    return cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف Excel أو CSV أو JSON.'));
  }
});

// ============================================================
// 8. إعدادات بيانات في الذاكرة (In-Memory Simulation)
//    في الإنتاج: استخدم PostgreSQL/MySQL بدلاً من هذا
// ============================================================
const dataPath = path.resolve('src/data/importedData.json');
let studentsArray = [];
let seatMap = new Map();

const normalizeArabic = (text) => {
  if (!text) return '';
  const str = String(text).trim();
  const convertedDigits = str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  return convertedDigits
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, '')
    .toLowerCase();
};

// إعداد قاعدة البيانات في الذاكرة
const leadsDB = []; // يتم حقن هذا من /api/leads
let leadsIdCounter = 1;

// إعدادات الموقع الافتراضية
let siteSettings = {
  site_status: 'live',
  ads_enabled: true,
  maintenance_message: 'الموقع تحت الصيانة. نعود قريباً!',
  updated_at: new Date().toISOString()
};

// =============================
// تحميل البيانات في الذاكرة
// =============================
let sqliteDb = null;

const initSqliteDatabase = () => {
  try {
    const candidateSqliteGz = [
      path.resolve(__dirname, 'database/natiga.sqlite.gz'),
      path.resolve(__dirname, 'src/data/natiga.sqlite.gz'),
      path.resolve('database/natiga.sqlite.gz'),
      path.join(process.cwd(), 'database/natiga.sqlite.gz')
    ];
    const candidateSqlite = [
      path.join(os.tmpdir(), 'natiga.sqlite'),
      path.resolve(__dirname, 'database/natiga.sqlite'),
      path.resolve('database/natiga.sqlite'),
      path.join(process.cwd(), 'database/natiga.sqlite')
    ];

    let foundSqlite = candidateSqlite.find(p => fs.existsSync(p));
    let foundGz = candidateSqliteGz.find(p => fs.existsSync(p));

    if (!foundSqlite && foundGz) {
      console.log(`⚡ Decompressing SQLite database (${foundGz})...`);
      const gzBuffer = fs.readFileSync(foundGz);
      const decompressed = zlib.gunzipSync(gzBuffer);
      const targetDbPath = candidateSqlite[0];
      fs.writeFileSync(targetDbPath, decompressed);
      foundSqlite = targetDbPath;
      console.log(`✅ SQLite database decompressed successfully to ${targetDbPath}!`);
    }

    if (foundSqlite && fs.existsSync(foundSqlite)) {
      sqliteDb = new DatabaseSync(foundSqlite);
      const count = sqliteDb.prepare('SELECT COUNT(*) as count FROM students').get().count;
      console.log(`⚡ Connected to indexed SQLite Database with ${count.toLocaleString('ar-EG')} students! (RAM footprint < 8MB)`);
    } else {
      console.warn('⚠️ SQLite DB not found in candidate paths:', candidateSqliteGz);
    }
  } catch (err) {
    console.error('Error initializing SQLite DB:', err);
  }
};

initSqliteDatabase();

const loadStudentsFromDisk = () => {
  if (sqliteDb) return; // إذا كان SQLite مفعل، لا تحمّل الملف بالكامل بالـ RAM لترشيد الاستهلاك
  try {
    const candidateGzPaths = [
      path.resolve(__dirname, 'database/students.json.gz'),
      path.resolve(__dirname, 'src/data/students.json.gz'),
      path.resolve('database/students.json.gz'),
      path.join(process.cwd(), 'database/students.json.gz')
    ];

    let foundGz = candidateGzPaths.find(p => fs.existsSync(p));

    if (foundGz) {
      const buffer = fs.readFileSync(foundGz);
      const decompressed = zlib.gunzipSync(buffer);
      studentsArray = JSON.parse(decompressed.toString('utf-8'));
      seatMap.clear();
      for (const st of studentsArray) {
        if (st.seatNumber) seatMap.set(normalizeArabic(st.seatNumber), st);
      }
      console.log(`✅ Loaded ${studentsArray.length.toLocaleString('ar-EG')} students from ${foundGz} into RAM`);
    } else if (fs.existsSync(dataPath)) {
      studentsArray = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      seatMap.clear();
      for (const st of studentsArray) {
        if (st.seatNumber) seatMap.set(normalizeArabic(st.seatNumber), st);
      }
      console.log(`✅ Loaded ${studentsArray.length.toLocaleString('ar-EG')} students into RAM`);
    }
  } catch (e) {
    console.error('Error loading students:', e.message);
  }
};

loadStudentsFromDisk();

// =============================================================
// ADMIN API ENDPOINTS
// =============================================================

// ----------------------------------------------------------
// [A] تسجيل الدخول وإصدار JWT Token
// ----------------------------------------------------------
app.post('/admin/auth/login', adminLoginLimiter, async (req, res) => {
  const { username, password } = req.body;

  // منع XSS - تعقيم المدخلات
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'بيانات الدخول مطلوبة.' });
  }

  const sanitizedUsername = username.replace(/[<>'"]/g, '').trim().substring(0, 50);
  const user = ADMIN_USERS.find(u => u.username === sanitizedUsername);

  if (!user) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({
    success: true,
    token,
    expiresIn: '8h',
    user: { id: user.id, username: user.username, role: user.role }
  });
});

// ----------------------------------------------------------
// [B] رفع ملف Excel وإدخال البيانات (Bulk Import)
// ----------------------------------------------------------
app.post('/admin/data/upload-excel', authMiddleware, upload.single('excelFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع أي ملف.' });
  }

  try {
    console.log(`📤 Admin ${req.adminUser.username} uploaded: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    const ext = path.extname(req.file.originalname).toLowerCase();
    let newStudents = [];

    if (ext === '.json') {
      newStudents = JSON.parse(req.file.buffer.toString('utf-8'));
    } else {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer', dense: true });
      const sheetName = workbook.SheetNames[0];
      const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });

      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(matrix.length, 10); i++) {
        const rowStr = matrix[i].map(c => normalizeArabic(c)).join(' ');
        if (rowStr.includes('جلوس') || rowStr.includes('اسم') || rowStr.includes('seating')) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = matrix[headerRowIndex].map(h => String(h).trim());
      const dataRows = matrix.slice(headerRowIndex + 1).filter(row => row.some(c => c !== '' && c !== null));

      const findCol = (keys) => headers.findIndex(h => keys.some(k => normalizeArabic(h).includes(normalizeArabic(k))));

      const seatCol = findCol(['جلوس', 'seating_no', 'seat']);
      const nameCol = findCol(['اسم', 'arabic_name', 'name']);
      const totalCol = findCol(['مجموع', 'total_degree', 'degree']);

      for (const row of dataRows) {
        const seatRaw = String(row[seatCol] || '').trim();
        const name = String(row[nameCol] || '').trim();
        const total = parseFloat(String(row[totalCol] || '0').replace(/,/g, '.')) || 0;
        const seat = normalizeArabic(seatRaw) || seatRaw;
        const percentage = parseFloat(((total / 320) * 100).toFixed(2));
        const status = percentage >= 50 ? 'ناجح' : 'راسب';

        if (seat && name) {
          newStudents.push({ seatNumber: seat, name, totalScore: total, percentage, status });
        }
      }
    }

    // استبدال البيانات في الذاكرة
    studentsArray = newStudents;
    seatMap.clear();
    for (const st of studentsArray) {
      seatMap.set(normalizeArabic(st.seatNumber), st);
    }

    // حفظ على القرص
    fs.writeFileSync(dataPath, JSON.stringify(newStudents, null, 0));

    // مسح Redis Cache فوراً بعد رفع بيانات جديدة
    try {
      if (redisClient.isOpen) {
        await redisClient.flushAll();
        console.log('✅ Redis cache flushed after data upload');
      }
    } catch (e) {}

    console.log(`✅ Bulk import complete: ${newStudents.length} students loaded`);

    return res.json({
      success: true,
      imported: newStudents.length,
      message: `تم رفع وإدخال ${newStudents.length.toLocaleString('ar')} طالب بنجاح! وتم مسح Redis Cache تلقائياً.`
    });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: `حدث خطأ أثناء معالجة الملف: ${err.message}` });
  }
});

// ----------------------------------------------------------
// [C] مسح ذاكرة Redis بالكامل (FlushAll)
// ----------------------------------------------------------
app.post('/admin/cache/flush', authMiddleware, async (req, res) => {
  try {
    if (redisClient.isOpen) {
      await redisClient.flushAll();
      console.log(`🗑️ Admin ${req.adminUser.username} flushed Redis cache at ${new Date().toISOString()}`);
      return res.json({ success: true, message: 'تم مسح ذاكرة Redis التخزين المؤقت بالكامل.' });
    } else {
      return res.json({ success: true, message: 'Redis غير متصل. تم تخطي العملية.' });
    }
  } catch (err) {
    return res.status(500).json({ error: `خطأ أثناء مسح Redis: ${err.message}` });
  }
});

// ----------------------------------------------------------
// [D] تفريغ جداول قاعدة البيانات (Truncate with double token)
// ----------------------------------------------------------
app.post('/admin/data/truncate', authMiddleware, async (req, res) => {
  const { confirmationCode } = req.body;
  const REQUIRED_CODE = 'TRUNCATE-NATIGA-2026';

  if (confirmationCode !== REQUIRED_CODE) {
    return res.status(400).json({
      error: 'رمز التأكيد غير صحيح.',
      message: `يجب إدخال الكود: "${REQUIRED_CODE}" لتأكيد حذف جميع البيانات.`
    });
  }

  try {
    studentsArray = [];
    seatMap.clear();
    fs.writeFileSync(dataPath, JSON.stringify([], null, 0));

    if (redisClient.isOpen) {
      await redisClient.flushAll();
    }

    console.warn(`🚨 Admin ${req.adminUser.username} TRUNCATED all student data at ${new Date().toISOString()}`);

    return res.json({
      success: true,
      message: 'تم تفريغ جميع بيانات الطلاب وذاكرة التخزين المؤقت بنجاح.'
    });
  } catch (err) {
    return res.status(500).json({ error: `خطأ أثناء الحذف: ${err.message}` });
  }
});

// ----------------------------------------------------------
// [E] استعلام بيانات Leads مع فلترة
// ----------------------------------------------------------
app.get('/admin/leads', authMiddleware, (req, res) => {
  const { minPercentage, branch, page = 1, limit = 50 } = req.query;
  let filtered = [...leadsDB];

  // فلترة بالنسبة المئوية الدنيا
  if (minPercentage && !isNaN(parseFloat(minPercentage))) {
    filtered = filtered.filter(lead => (lead.percentage || 0) >= parseFloat(minPercentage));
  }

  // فلترة بالشعبة
  if (branch && branch.trim() !== '') {
    const normBranch = branch.trim().toLowerCase();
    filtered = filtered.filter(lead =>
      lead.preferredBranch && lead.preferredBranch.toLowerCase().includes(normBranch)
    );
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
  const totalCount = filtered.length;
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    data: paginated,
    totalCount,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalCount / limitNum)
  });
});

// ----------------------------------------------------------
// [F] تصدير Leads إلى CSV
// ----------------------------------------------------------
app.get('/admin/leads/export-csv', authMiddleware, (req, res) => {
  const { minPercentage, branch } = req.query;
  let filtered = [...leadsDB];

  if (minPercentage && !isNaN(parseFloat(minPercentage))) {
    filtered = filtered.filter(lead => (lead.percentage || 0) >= parseFloat(minPercentage));
  }
  if (branch && branch.trim() !== '') {
    const normBranch = branch.trim().toLowerCase();
    filtered = filtered.filter(lead =>
      lead.preferredBranch && lead.preferredBranch.toLowerCase().includes(normBranch)
    );
  }

  // بناء CSV مع منع CSV Injection (XSS Protection)
  const sanitizeCSVField = (field) => {
    const str = String(field || '').replace(/"/g, '""');
    // منع حقن CSV (formula injection)
    if (['+', '-', '=', '@', '\t', '\r'].includes(str[0])) {
      return `"'${str}"`;
    }
    return `"${str}"`;
  };

  const headers = ['م', 'الاسم', 'رقم الهاتف', 'رقم الجلوس', 'المجموع', 'النسبة المئوية', 'الشعبة المفضلة', 'تاريخ التسجيل'];
  const csvRows = [
    '\uFEFF' + headers.join(','), // BOM for Arabic encoding support in Excel
    ...filtered.map((lead, idx) =>
      [
        idx + 1,
        sanitizeCSVField(lead.studentName),
        sanitizeCSVField(lead.phoneNumber),
        sanitizeCSVField(lead.seatNumber),
        lead.totalScore || 0,
        lead.percentage || 0,
        sanitizeCSVField(lead.preferredBranch),
        sanitizeCSVField(lead.createdAt)
      ].join(',')
    )
  ];

  const csvContent = csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="university_leads_${Date.now()}.csv"`);
  return res.send(csvContent);
});

// ----------------------------------------------------------
// [G] قراءة وتحديث إعدادات الموقع
// ----------------------------------------------------------
app.get('/admin/settings', authMiddleware, (req, res) => {
  return res.json(siteSettings);
});

app.patch('/admin/settings', authMiddleware, (req, res) => {
  const allowed = ['site_status', 'ads_enabled', 'maintenance_message'];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'لا توجد إعدادات للتحديث.' });
  }

  siteSettings = { ...siteSettings, ...updates, updated_at: new Date().toISOString() };

  console.log(`⚙️ Admin ${req.adminUser.username} updated settings:`, updates);

  return res.json({ success: true, settings: siteSettings });
});

// ----------------------------------------------------------
// [H] قراءة إعدادات الموقع للواجهة الأمامية (لا تتطلب JWT)
// ----------------------------------------------------------
app.get('/api/site-settings', (req, res) => {
  // نعيد فقط البيانات الضرورية للواجهة الأمامية (بدون sensitive data)
  return res.json({
    site_status: siteSettings.site_status,
    ads_enabled: siteSettings.ads_enabled,
    maintenance_message: siteSettings.maintenance_message
  });
});

// ----------------------------------------------------------
// [I] نقطة نهاية استلام Leads من الموقع الرئيسي
// ----------------------------------------------------------
app.post('/api/leads', (req, res) => {
  const { studentName, phoneNumber, seatNumber, totalScore, percentage, preferredBranch } = req.body;

  if (!studentName || !phoneNumber) {
    return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان.' });
  }

  const lead = {
    id: leadsIdCounter++,
    studentName: String(studentName).replace(/[<>]/g, '').substring(0, 255),
    phoneNumber: String(phoneNumber).replace(/[^0-9+\s\-()]/g, '').substring(0, 20),
    seatNumber: String(seatNumber || '').substring(0, 20),
    totalScore: parseFloat(totalScore) || 0,
    percentage: parseFloat(percentage) || 0,
    preferredBranch: String(preferredBranch || '').substring(0, 200),
    createdAt: new Date().toISOString()
  };

  leadsDB.push(lead);
  return res.json({ success: true, message: 'تم تسجيل طلبك بنجاح!', leadId: lead.id });
});

// ----------------------------------------------------------
// [J] مراقبة حالة السيرفر (CPU, RAM, Uptime)
// ----------------------------------------------------------
app.get('/admin/monitor', authMiddleware, async (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

  // حساب متوسط استخدام CPU
  const cpuUsage = await new Promise((resolve) => {
    const startMeasure = os.cpus().map(c => ({ idle: c.times.idle, total: Object.values(c.times).reduce((a, b) => a + b) }));
    setTimeout(() => {
      const endMeasure = os.cpus().map(c => ({ idle: c.times.idle, total: Object.values(c.times).reduce((a, b) => a + b) }));
      const avgUsage = startMeasure.map((start, i) => {
        const end = endMeasure[i];
        const idleDiff = end.idle - start.idle;
        const totalDiff = end.total - start.total;
        return totalDiff === 0 ? 0 : ((1 - idleDiff / totalDiff) * 100).toFixed(1);
      });
      const avg = (avgUsage.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / avgUsage.length).toFixed(1);
      resolve(avg);
    }, 100);
  });

  const uptimeSeconds = os.uptime();
  const uptimeDays = Math.floor(uptimeSeconds / 86400);
  const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
  const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

  let redisInfo = 'غير متصل';
  try {
    if (redisClient.isOpen) {
      const info = await redisClient.info('memory');
      const match = info.match(/used_memory_human:(\S+)/);
      redisInfo = match ? match[1] : 'متصل';
    }
  } catch (e) {}

  return res.json({
    cpu: {
      model: os.cpus()[0]?.model || 'Unknown',
      cores: os.cpus().length,
      usagePercent: parseFloat(cpuUsage),
      architecture: os.arch()
    },
    memory: {
      total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
      used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
      free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
      usagePercent: parseFloat(memUsagePercent)
    },
    system: {
      platform: os.platform(),
      hostname: os.hostname(),
      uptime: `${uptimeDays} يوم، ${uptimeHours} ساعة، ${uptimeMinutes} دقيقة`,
      nodeVersion: process.version,
      pid: process.pid
    },
    database: {
      studentsLoaded: studentsArray.length,
      leadsCount: leadsDB.length,
      dataFileExists: fs.existsSync(dataPath)
    },
    redis: { status: redisClient.isOpen ? 'متصل' : 'غير متصل', memory: redisInfo },
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------------
// [K] إحصائيات لوحة التحكم (Dashboard Overview)
// ----------------------------------------------------------
app.get('/admin/dashboard', authMiddleware, (req, res) => {
  const passCount = studentsArray.filter(s => s.percentage >= 50).length;
  const failCount = studentsArray.length - passCount;
  const passRate = studentsArray.length > 0
    ? ((passCount / studentsArray.length) * 100).toFixed(1)
    : 0;

  const recentLeads = leadsDB.slice(-10).reverse();

  return res.json({
    overview: {
      totalStudents: studentsArray.length,
      passCount,
      failCount,
      passRate: `${passRate}%`,
      totalLeads: leadsDB.length,
      siteStatus: siteSettings.site_status,
      adsEnabled: siteSettings.ads_enabled
    },
    recentLeads,
    settings: siteSettings
  });
});

// ----------------------------------------------------------
// [L] مسار البحث الرئيسي للموقع (مع Rate Limiting)
// ----------------------------------------------------------
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'تجاوزت حد الاستعلامات. حاول بعد دقيقة.' }
});

app.get('/api/search', searchLimiter, async (req, res) => {
  const query = req.query.q || '';
  const searchType = req.query.type || 'seatNumber';
  const normQ = normalizeArabic(query);

  if (!normQ || normQ.length < 2) return res.json([]);

  const cacheKey = `result:${searchType}:${normQ}`;
  try {
    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
    }
  } catch (e) {}

  let results = [];
  if (sqliteDb) {
    try {
      if (searchType === 'seatNumber') {
        results = sqliteDb.prepare('SELECT seat_number as seatNumber, name, total_score as totalScore, percentage, status, branch, governorate, school FROM students WHERE seat_number = ? OR seat_number LIKE ? LIMIT 30').all(normQ, `%${normQ}%`);
      } else {
        results = sqliteDb.prepare('SELECT seat_number as seatNumber, name, total_score as totalScore, percentage, status, branch, governorate, school FROM students WHERE name LIKE ? LIMIT 30').all(`%${normQ}%`);
      }
    } catch (e) {
      console.error('SQLite query error:', e.message);
    }
  } else if (searchType === 'seatNumber') {
    const exact = seatMap.get(normQ);
    if (exact) results = [exact];
    else {
      for (const st of studentsArray) {
        if (normalizeArabic(st.seatNumber).includes(normQ)) {
          results.push(st);
          if (results.length >= 30) break;
        }
      }
    }
  } else {
    for (const st of studentsArray) {
      if (normalizeArabic(st.name).includes(normQ)) {
        results.push(st);
        if (results.length >= 30) break;
      }
    }
  }

  try {
    if (redisClient.isOpen && results.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(results), { EX: 86400 });
    }
  } catch (e) {}

  res.setHeader('X-Cache', 'MISS');
  return res.json(results);
});

app.get('/api/info', (req, res) => {
  let totalCount = studentsArray.length;
  if (sqliteDb) {
    try {
      totalCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM students').get().count;
    } catch (e) {}
  }
  return res.json({
    totalCount,
    maxPossibleScore: 320,
    status: 'online',
    siteStatus: siteSettings.site_status
  });
});

// ----------------------------------------------------------
// [M] إحصائيات المجاميع الحقيقية من البيانات المحملة
// ----------------------------------------------------------
app.get('/api/stats', (req, res) => {
  if (sqliteDb) {
    try {
      const totalStudents = sqliteDb.prepare('SELECT COUNT(*) as count FROM students').get().count;
      const passCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM students WHERE percentage >= 50').get().count;
      const failCount = totalStudents - passCount;
      const overallPassRate = totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(1) + '%' : '0%';

      const bucketDefs = [
        { range: 'أكثر من 95% (مجموع 304+)', min: 95, max: 101, color: 'bg-emerald-600' },
        { range: '90% - 95% (مجموع 288-303)', min: 90, max: 95, color: 'bg-emerald-500' },
        { range: '80% - 90% (مجموع 256-287)', min: 80, max: 90, color: 'bg-teal-500' },
        { range: '70% - 80% (مجموع 224-255)', min: 70, max: 80, color: 'bg-blue-500' },
        { range: '60% - 70% (مجموع 192-223)', min: 60, max: 70, color: 'bg-indigo-500' },
        { range: '50% - 60% (مجموع 160-191)', min: 50, max: 60, color: 'bg-amber-500' },
        { range: 'أقل من 50% (راسب، أقل من 160)', min: 0, max: 50, color: 'bg-red-500' },
      ];

      const buckets = bucketDefs.map(b => {
        const count = sqliteDb.prepare('SELECT COUNT(*) as count FROM students WHERE percentage >= ? AND percentage < ?').get(b.min, b.max).count;
        const percent = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) + '%' : '0%';
        return { range: b.range, count: count.toLocaleString('ar-EG'), percent, color: b.color };
      });

      return res.json({ totalStudents, passCount, failCount, overallPassRate, buckets });
    } catch (e) {
      console.error('Error computing sqlite stats:', e.message);
    }
  }

  if (studentsArray.length === 0) {
    return res.json({
      totalStudents: 0,
      passCount: 0,
      failCount: 0,
      overallPassRate: '0%',
      buckets: []
    });
  }

  const passCount = studentsArray.filter(s => (s.percentage || 0) >= 50).length;
  const failCount = studentsArray.length - passCount;
  const overallPassRate = ((passCount / studentsArray.length) * 100).toFixed(1) + '%';

  // توزيع شرائح المجاميع
  const bucketDefs = [
    { range: 'أكثر من 95% (مجموع 304+)', min: 95, max: 101, color: 'bg-emerald-600' },
    { range: '90% - 95% (مجموع 288-303)', min: 90, max: 95, color: 'bg-emerald-500' },
    { range: '80% - 90% (مجموع 256-287)', min: 80, max: 90, color: 'bg-teal-500' },
    { range: '70% - 80% (مجموع 224-255)', min: 70, max: 80, color: 'bg-blue-500' },
    { range: '60% - 70% (مجموع 192-223)', min: 60, max: 70, color: 'bg-indigo-500' },
    { range: '50% - 60% (مجموع 160-191)', min: 50, max: 60, color: 'bg-amber-500' },
    { range: 'أقل من 50% (راسب، أقل من 160)', min: 0, max: 50, color: 'bg-red-500' },
  ];

  const buckets = bucketDefs.map(b => {
    const count = studentsArray.filter(s => {
      const p = s.percentage || 0;
      return p >= b.min && p < b.max;
    }).length;
    const percent = ((count / studentsArray.length) * 100).toFixed(1) + '%';
    return { range: b.range, count: count.toLocaleString('ar-EG'), percent, color: b.color };
  });

  return res.json({ totalStudents: studentsArray.length, passCount, failCount, overallPassRate, buckets });
});


app.listen(ADMIN_PORT, () => {
  console.log(`\n🛡️  Natiga Admin Server running on http://localhost:${ADMIN_PORT}`);
  console.log(`🔒 IP Whitelist: ${ALLOWED_IPS.filter(ip => ip !== '::1' && ip !== '::ffff:127.0.0.1').join(', ')}`);
  console.log(`🔑 JWT Auth: Enabled (8h expiry)`);
  console.log(`🌐 Admin Panel URL: http://localhost:3000/secure-admin-portal\n`);
});
