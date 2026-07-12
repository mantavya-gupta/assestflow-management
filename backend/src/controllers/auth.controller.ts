import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, encrypt } from '../lib/auth';
import crypto from 'crypto';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function signup(req: Request, res: Response) {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { name, email, password } = result.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during signup.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ 
      user: { id: user.id, email: user.email, role: user.role, name: user.name }, 
      expires 
    });

    res.cookie('session', session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // 'lax' (not 'strict') so the cookie still works if frontend and
      // backend ever end up on different subdomains/hosts in production.
      // The other half of making this cookie actually arrive at all is
      // the frontend sending `credentials: 'include'` on every request.
      sameSite: 'lax',
      path: '/',
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { email } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.json({ success: 'If that email exists, a reset link has been generated.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, expiresAt, userId: user.id },
    });

    // In a real deployment this token is emailed to the user, never
    // returned in the API response. Logging it server-side only (not
    // sent to the client) is a stand-in for that email step in local dev.
    if (process.env.NODE_ENV !== 'production') {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      console.log(`\n=== [DEV ONLY] PASSWORD RESET LINK ===\nUser: ${email}\nLink: ${resetLink}\n=======================================\n`);
    }

    res.json({ success: 'If that email exists, a reset link has been generated.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { token, password } = result.data;
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    const hashedPassword = await hashPassword(password);

    try {
      // Delete the token FIRST. Prisma's delete on a unique id is atomic,
      // so if two requests race on the same token, only one delete can
      // succeed — the loser throws (record not found) and is treated as
      // an already-used/invalid token, instead of both requests being
      // able to reset the password.
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const deleted = await tx.passwordResetToken.delete({
          where: { id: resetToken.id },
        });
        await tx.user.update({
          where: { id: deleted.userId },
          data: { password: hashedPassword },
        });
      });
    } catch (err) {
      return res.status(400).json({ error: 'This reset link has already been used or is no longer valid.' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('session', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ success: true });
}

export async function me(req: Request, res: Response) {
  // requires requireAuth middleware which populates req.user
  res.json({ success: true, user: (req as any).user });
}
