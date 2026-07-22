// Central API configuration for local dev and live Render production backend
export const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : 'https://natiga-backend-2026.onrender.com';
