import rateLimit from 'express-rate-limit';

/**
 * Tight limiter for login: the most valuable target for brute-forcing.
 * Applied here (Express, backend) rather than in Next.js middleware,
 * because that's where the requests actually land — the frontend
 * calls this API directly and previously bypassed the Next.js
 * middleware's login rate limiter entirely.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in a minute.' },
});

/**
 * Looser limiter for signup / forgot-password to slow down abuse
 * (account enumeration, mass account creation, reset-link spam)
 * without hurting normal usage.
 */
export const authActionRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});
