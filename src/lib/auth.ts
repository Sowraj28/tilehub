import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-prod-32chars';

export function signToken(payload: Record<string, unknown>, expiresIn = '8h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getAdminFromCookies(): Promise<Record<string, unknown> | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSubAdminFromCookies(): Promise<Record<string, unknown> | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('subadmin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getTokenFromRequest(
  req: NextRequest,
  cookieName: string
): Record<string, unknown> | null {
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  return verifyToken(token);
}
