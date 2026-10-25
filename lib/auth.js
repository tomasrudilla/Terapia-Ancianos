import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASS || 'change-me');

export async function createAdminToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyAdmin(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export function adminCredentialsValid(user, pass) {
  const u = process.env.ADMIN_USER || 'admin';
  const p = process.env.ADMIN_PASS || 'calma2026';
  return user === u && pass === p;
}
