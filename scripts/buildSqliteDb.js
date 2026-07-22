import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { DatabaseSync } from 'node:sqlite';

const jsonPath = path.resolve('src/data/importedData.json');
const gzPath = path.resolve('database/students.json.gz');
const dbPath = path.resolve('database/natiga.sqlite');

console.log('⚡ Creating optimized SQLite database at:', dbPath);

let students = [];
if (fs.existsSync(gzPath)) {
  console.log('📖 Decompressing database/students.json.gz (17 MB)...');
  const buffer = fs.readFileSync(gzPath);
  const decompressed = zlib.gunzipSync(buffer);
  students = JSON.parse(decompressed.toString('utf-8'));
} else if (fs.existsSync(jsonPath)) {
  console.log('📖 Reading JSON dataset...');
  students = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
} else {
  console.error('❌ No dataset found to build SQLite DB!');
  process.exit(0);
}

if (fs.existsSync(dbPath)) {
  try { fs.unlinkSync(dbPath); } catch(e) {}
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

console.log(`📥 Inserting ${students.length.toLocaleString('ar-EG')} students into SQLite...`);

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO students (seat_number, name, total_score, percentage, status, branch, governorate, school)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');

let count = 0;
for (const s of students) {
  insertStmt.run(
    String(s.seatNumber || ''),
    String(s.name || ''),
    Number(s.totalScore || 0),
    Number(s.percentage || 0),
    String(s.status || 'ناجح'),
    String(s.branch || 'عام'),
    String(s.governorate || 'جمهورية مصر العربية'),
    String(s.school || 'المدرسة الثانوية العامة')
  );
  count++;
}

db.exec('COMMIT');

console.log(`✅ Successfully built indexed SQLite database with ${count.toLocaleString('ar-EG')} students!`);
db.close();
