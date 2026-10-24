const ADMIN_KEY = 'espacio_calma_admin_token';

export function getAdminToken() {
  return sessionStorage.getItem(ADMIN_KEY);
}

export function setAdminToken(token) {
  sessionStorage.setItem(ADMIN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_KEY);
}

export async function apiGet(path) {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

export async function apiPost(path, body, admin = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (admin) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}
