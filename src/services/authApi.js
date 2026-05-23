const BASE    = import.meta.env.VITE_API_URL    ?? 'http://localhost:4000';
const AI_BASE = import.meta.env.VITE_AI_URL     ?? 'http://127.0.0.1:8000';

/**
 * POST /api/auth/signup
 */
export async function apiSignup({ email, username, password, full_name }) {
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, full_name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Signup failed. Please try again.');
  return data;
}

/**
 * POST /api/auth/login
 */
export async function apiLogin({ email, password }) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Login failed. Please try again.');
  return data;
}

/**
 * POST /api/detect
 * Multer expects field name "image". JWT required in Authorization header.
 * Returns { detection, history_id, image_url }
 */
export async function apiDetect(file, token) {
  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${BASE}/api/detect`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Detection failed. Please try again.');
  return data; // { detection, history_id, image_url }
}

/**
 * POST /estimate  — proxied through Vite dev server → FastAPI AI service
 * (relative path avoids CORS: browser hits localhost:5173/estimate, Vite
 *  forwards it to 127.0.0.1:8000/estimate server-side)
 *
 * Input:  { make, model_name, year_range, damaged_parts: string[] }
 * Output: [{ part_name, original_new, original_used, aftermarket }, ...]
 */
export async function apiEstimate({ make, model_name, year_range, damaged_parts }) {
  const res = await fetch('/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ make, model_name, year_range, damaged_parts }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.detail ?? data?.message ?? 'Price estimation failed.';
    throw new Error(Array.isArray(msg) ? msg.map(e => e.msg).join(', ') : msg);
  }
  return data; // Array<{ part_name, original_new, original_used, aftermarket }>
}

/**
 * GET /api/history
 * Returns the authenticated user's detection history.
 * Response: { history: DetectionHistoryRow[] }
 * Each row: { id, user_id, image_url, status, detections: [...], created_at }
 */
export async function apiGetHistory(token) {
  const res = await fetch(`${BASE}/api/history`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load history.');
  return data.history ?? []; // DetectionHistoryRow[]
}

