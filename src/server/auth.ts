import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import { UserProfile, StaffRole } from '../types/index.ts';

interface ActiveSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: StaffRole;
  dentistId?: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory sessions store (valid for 24 hours)
const sessions = new Map<string, ActiveSession>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function hashPassword(plainText: string): string {
  return crypto.createHash('sha256').update(plainText).digest('hex');
}

export function createSession(user: UserProfile): string {
  const token = crypto.randomBytes(32).toString('hex');
  const session: ActiveSession = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    dentistId: user.dentistId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  sessions.set(token, session);
  return token;
}

export function verifySession(token?: string): ActiveSession | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function destroySession(token?: string): void {
  if (token) {
    sessions.delete(token);
  }
}

// Express auth middleware
export interface AuthenticatedRequest extends Request {
  user?: ActiveSession;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);

  const session = verifySession(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in to the clinic admin console.' });
  }

  req.user = session;
  next();
}

export function requireRole(allowedRoles: StaffRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of [${allowedRoles.join(', ')}], current role is '${req.user.role}'`,
      });
    }
    next();
  };
}
