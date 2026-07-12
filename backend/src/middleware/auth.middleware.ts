import { Request, Response, NextFunction } from 'express';
import { decrypt } from '../lib/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

/**
 * Requires a valid `session` cookie. Populates req.user on success.
 * Responds 401 if the cookie is missing, malformed, or expired.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const session = req.cookies?.session;

  if (!session) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const payload = await decrypt(session);

  if (!payload || !payload.user) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }

  req.user = payload.user;
  next();
}

/**
 * Restricts access to one or more roles. Must run after requireAuth.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }
    next();
  };
}
