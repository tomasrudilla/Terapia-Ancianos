import { adminCredentialsValid, createAdminToken } from '../lib/auth.js';
import { json, readJson } from '../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  try {
    const body = await readJson(req);
    const user = String(body.user || '').trim();
    const pass = String(body.pass || '');

    if (!adminCredentialsValid(user, pass)) {
      return json(res, 401, { error: 'Usuario o contraseña incorrectos' });
    }

    const token = await createAdminToken();
    return json(res, 200, { ok: true, token });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
