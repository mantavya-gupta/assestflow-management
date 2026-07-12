'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import crypto from 'crypto';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function signupAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = signupSchema.safeParse({ name, email, password });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: 'A user with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    
    // The role will default to EMPLOYEE as defined in the Prisma schema
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'An unexpected error occurred during signup.' };
  }

  redirect('/login?registered=true');
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;

  const result = forgotPasswordSchema.safeParse({ email });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return a vague message to prevent email enumeration
      return { success: 'If that email exists, a reset link has been generated.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // In a real application, we would email this link.
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    console.log(`\n\n=== PASSWORD RESET LINK GENERATED ===\nUser: ${email}\nLink: ${resetLink}\n=======================================\n\n`);

    return { 
      success: 'If that email exists, a reset link has been generated.', 
      _mockLink: resetLink // Only passing this for demo purposes, remove in prod!
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { error: 'An unexpected error occurred.' };
  }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;

  const result = resetPasswordSchema.safeParse({ token, password });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return { error: 'Invalid or expired reset token.' };
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { error: 'Reset token has expired. Please request a new one.' };
    }

    const hashedPassword = await hashPassword(password);

    // Update user password and delete token within a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'An unexpected error occurred.' };
  }

  redirect('/login?reset=true');
}
