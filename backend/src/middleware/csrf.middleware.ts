import { Request, Response, NextFunction } from 'express';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

/**
 * Rejects state-changing requests whose Origin header doesn't match
 * an allowed origin. This is the real enforcement point — the
 * equivalent check in the Next.js middleware only ever saw requests
 * to the Next.js app itself, never the cross-origin calls the
 * frontend makes directly to this API.
 */
export function verifyOrigin(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const origin = req.headers.origin;

  // Allow same-origin/non-browser requests (no Origin header, e.g. curl, server-to-server).
  if (!origin) {
    return next();
  }

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden: origin not allowed.' });
  }

  next();
}
