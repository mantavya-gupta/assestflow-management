import { Request, Response, NextFunction } from 'express';

// Exported so server.ts can configure `cors` with the exact same list —
// previously the two were parsed independently and only the first origin
// was ever passed to `cors`, which silently broke any deployment with more
// than one allowed origin (the browser would reject the response even
// though this middleware would have allowed the request).
export const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
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
