import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      // Fail fast rather than silently signing tokens with a public,
      // guessable default secret in production.
      throw new Error('JWT_SECRET environment variable is required in production.');
    }
    console.warn('[auth] JWT_SECRET is not set — using an insecure default for local development only.');
  }

  return new TextEncoder().encode(secret || 'dev-only-insecure-secret');
}

const key = getSecretKey();

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
