const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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
