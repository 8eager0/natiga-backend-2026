// Arabic text & digit normalization for flexible searching
export const normalizeArabic = (text) => {
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

export const BRANCHES = {
  SCIENCE: 'علمي علوم',
  MATH: 'علمي رياضة',
  ARTS: 'أدبي',
};

export const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الشرقية', 'الدقهلية', 'الغربية', 'المنوفية', 'القليوبية', 'البحيرة', 'أسيوط', 'سوهاج', 'قنا', 'المنيا', 'بني سويف', 'الفيوم', 'الإسماعيلية', 'بورسعيد', 'السويس', 'أسوان', 'الأقصر', 'كفر الشيخ', 'دمياط', 'شمال سيناء', 'جنوب سيناء', 'الوادي الجديد', 'مطروح', 'البحر الأحمر'
];

export const calculateStudentStats = (student) => {
  const addedSubjects = student.subjects ? student.subjects.filter(s => s.isAdded) : [];
  const totalScore = student.totalScore !== undefined && student.totalScore !== null
    ? Number(student.totalScore)
    : addedSubjects.reduce((acc, curr) => acc + curr.score, 0);
    
  const maxPossible = 320;
  const percentage = Number(((totalScore / maxPossible) * 100).toFixed(2));
  
  return {
    totalScore,
    maxPossible,
    percentage,
  };
};

import { API_BASE_URL } from '../config';

// Async API search against 810,980 RAM Indexed backend
export const searchStudentsAsync = async (query, searchType = 'seatNumber', customStudents = [], filters = {}) => {
  const normQuery = normalizeArabic(query);
  const { minScore, maxScore } = filters;

  if (!normQuery && (minScore === undefined || minScore === '') && (maxScore === undefined || maxScore === '')) {
    return [];
  }

  let url = `${API_BASE_URL}/api/search?q=${encodeURIComponent(normQuery)}&type=${searchType}`;
  if (minScore !== undefined && minScore !== '') url += `&minScore=${minScore}`;
  if (maxScore !== undefined && maxScore !== '') url += `&maxScore=${maxScore}`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend API offline, falling back to in-memory custom data', err);
  }

  // Fallback to customStudents array if backend API is offline
  return customStudents.filter(student => {
    let matches = true;
    if (normQuery) {
      if (searchType === 'seatNumber') {
        matches = normalizeArabic(student.seatNumber).includes(normQuery);
      } else {
        matches = normalizeArabic(student.name).includes(normQuery);
      }
    }
    if (!matches) return false;

    const score = Number(student.totalScore || 0);
    if (minScore !== undefined && minScore !== '' && score < Number(minScore)) return false;
    if (maxScore !== undefined && maxScore !== '' && score > Number(maxScore)) return false;

    return true;
  });
};
