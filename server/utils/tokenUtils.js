import jwt from 'jsonwebtoken';

export const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

export const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';

  // ── WHY THESE SETTINGS MATTER IN PRODUCTION ───────────────────────
  //
  // In local development, frontend (localhost:5173) and backend
  // (localhost:8000) are treated as the "same site" by browsers, so
  // cookies flow freely between them with sameSite: 'lax'.
  //
  // In production, frontend (bazario.vercel.app) and backend
  // (bazario-api.onrender.com) are completely different domains.
  // Browsers block cookies from crossing different domains UNLESS:
  //   1. sameSite is set to 'none'  (explicitly allows cross-domain)
  //   2. secure is set to true      ('none' only works over HTTPS)
  //
  // Both Vercel and Render serve over HTTPS automatically, so this
  // is safe and works correctly in production.
  // ─────────────────────────────────────────────────────────────────

  res.cookie('accessToken', accessToken, {
    httpOnly: true,       // JS can't read it — prevents XSS attacks
    secure: isProd,       // HTTPS only in production
    sameSite: isProd ? 'none' : 'lax', // cross-domain in prod, relaxed locally
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearTokenCookies = (res) => {
  const isProd = process.env.NODE_ENV === 'production';

  // Must use the SAME settings as setTokenCookies when clearing —
  // if these don't match, the browser won't recognise which cookie
  // to delete and the old one will linger.
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
};
