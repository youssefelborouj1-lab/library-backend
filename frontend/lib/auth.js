import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'library_secret_key_change_me';
const COOKIE_NAME = 'library_token';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }));
}

export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  }));
}

export function getTokenFromRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies[COOKIE_NAME] || null;
}

export function getUserFromRequest(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(handler, roles = []) {
  return async (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    if (roles.length > 0 && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    req.user = user;
    return handler(req, res);
  };
}
