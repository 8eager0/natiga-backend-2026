-- ============================================================
-- قاعدة بيانات نتيجة الثانوية العامة 2026 - High-Performance Schema
-- ============================================================

-- 1. جدول الطلاب والنتائج الرئيسي
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    seat_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) DEFAULT 'عام',
    governorate VARCHAR(100) DEFAULT 'جمهورية مصر العربية',
    school VARCHAR(255) DEFAULT 'المدرسة الثانوية العامة',
    total_score NUMERIC(5, 2) NOT NULL,
    max_possible NUMERIC(5, 2) DEFAULT 320.00,
    percentage NUMERIC(5, 2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'ناجح' أو 'راسب'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- الفهارس عالية السرعة للبحث في أجزاء من الملي ثانية (B-Tree Indexes)
CREATE INDEX IF NOT EXISTS idx_students_seat_number ON students (seat_number);
CREATE INDEX IF NOT EXISTS idx_students_normalized_name ON students (normalized_name);
CREATE INDEX IF NOT EXISTS idx_students_total_score ON students (total_score DESC);

-- 2. جدول تجميع بيانات الطلاب للجامعات الخاصة (Lead Generation Database)
CREATE TABLE IF NOT EXISTS university_leads (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    seat_number VARCHAR(20),
    total_score NUMERIC(5, 2),
    percentage NUMERIC(5, 2),
    preferred_branch VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_phone ON university_leads (phone_number);
