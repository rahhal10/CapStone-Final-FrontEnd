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
 * POST /api/estimate  — goes through the Node backend (NOT directly to FastAPI).
 * The backend calls FastAPI /estimate, saves pricing to the DB, and returns the result.
 *
 * Input:  { history_id, make, model_name, year_range, damaged_parts: string[] }
 * Output: { history_id, make, model, year_range, damaged_parts, pricing: { parts, totals }, estimate_status }
 */
export async function apiEstimate({ history_id, make, model_name, year_range, damaged_parts }, token) {
  const res = await fetch(`${BASE}/api/estimate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      history_id,
      make,
      model:         model_name,   // backend expects "model" not "model_name"
      year_range,
      damaged_parts,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? data?.detail ?? 'Price estimation failed.';
    throw new Error(Array.isArray(msg) ? msg.map(e => e.msg).join(', ') : msg);
  }
  // Response: { history_id, make, model, year_range, damaged_parts, pricing: { parts, totals }, estimate_status }
  return data;
}

/**
 * PUT /api/auth/me
 * Updates the authenticated user's username and/or password.
 * Requires current_password when changing password.
 */
export async function apiUpdateMe({ username, password, current_password }, token) {
  const res = await fetch(`${BASE}/api/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, password, current_password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Update failed.');
  return data; // { user: { id, email, username, full_name } }
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

