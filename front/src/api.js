const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:3003';

// helper that includes cookies for session auth
async function apiFetch(path, opts = {}) {
  const url = `${API_URL}${path}`;
  const options = {
    credentials: 'include', // send cookies for session
    headers: { 'Content-Type': 'application/json' },
    ...opts
  };
  if (options.body && typeof options.body !== 'string') {
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, options);
  // try to parse JSON safely
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch(e){ data = text; }
  if (!res.ok) {
    const err = new Error(data?.error?.message || data?.message || res.statusText);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function getServices() {
  return apiFetch('/services', { method: 'GET' });
}

export async function getService(id) {
  return apiFetch(`/services/${id}`, { method: 'GET' });
}

export async function getBookings(userId) {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return apiFetch(`/bookings${qs}`, { method: 'GET' });
}

export async function createBooking(payload) {
  return apiFetch('/bookings', { method: 'POST', body: payload });
}

export async function checkAuth() {
  return apiFetch('/auth/success', { method: 'GET' });
}

export function startGoogleAuth() {
  // redirect browser to backend auth endpoint (will set session cookie)
  window.location.href = `${API_URL}/auth/google`;
}

export async function logout() {
  return apiFetch('/auth/logout', { method: 'GET' });
}
