import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

export interface JwtPayload {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  iat?: number;
  exp?: number;
}

export async function getAdminFromToken(req?: NextRequest) {
  const token = req ? req.cookies.get('admin-token')?.value : (await cookies()).get('admin-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!["SUPER_ADMIN", "TOURISM_ADMIN"].includes(decoded.role)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function getConsumerFromToken(req?: NextRequest) {
  const token = req ? req.cookies.get('consumer-token')?.value : (await cookies()).get('consumer-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded.role !== "CONSUMER") return null;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
} 