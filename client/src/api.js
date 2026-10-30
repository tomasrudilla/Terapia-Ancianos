const ADMIN_KEY = 'espacio_calma_admin_token';
const API_TIMEOUT_MS = 12_000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(
        'La API no respondió a tiempo. En local usá http://localhost:3001/reservar (npm run dev:local) y DATABASE_URL en .env',
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function getAdminToken() {
  return sessionStorage.getItem(ADMIN_KEY);
}

export function setAdminToken(token) {
  sessionStorage.setItem(ADMIN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_KEY);
}

async function parseApiResponse(res) {
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new Error(
          res.status === 502 || res.status === 504
            ? 'No se pudo conectar con la API. En local ejecutá: npx vercel dev --listen 3001 (con DATABASE_URL en .env)'
            : `Respuesta inválida del servidor (${res.status})`,
        );
      }
    }
  }
  if (!res.ok) {
    throw new Error(data.error || `Error del servidor (${res.status})`);
  }
  return data;
}

export async function apiGet(path) {
  let res;
  try {
    res = await fetchWithTimeout(path);
  } catch {
    throw new Error(
      'No hay conexión con la API. En local: npx vercel dev --listen 3001 y DATABASE_URL en .env',
    );
  }
  return parseApiResponse(res);
}

export async function apiPost(path, body, admin = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (admin) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetchWithTimeout(path, { method: 'POST', headers, body: JSON.stringify(body) });
  } catch {
    throw new Error(
      'No hay conexión con la API. En local: npx vercel dev --listen 3001 y DATABASE_URL en .env',
    );
  }
  return parseApiResponse(res);
}

export async function apiDelete(path, body) {
  const token = getAdminToken();
  const res = await fetch(path, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return parseApiResponse(res);
}
