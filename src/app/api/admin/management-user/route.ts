import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

async function getAdminFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (decoded.role !== "SUPER_ADMIN") return null; // Only Super Admin can access this API
    return decoded;
  } catch {
    return null;
  }
}
// GET: Get all users (consumers and tourism_admins)
export async function GET() {
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error('[ADMIN_USER_MANAGEMENT_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch users', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
// POST: Create a new tourism_admin user
export async function POST(req: NextRequest) {
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const saltRounds = 10; // Recommended salt rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.TOURISM_ADMIN, // Set role to TOURISM_ADMIN
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_USER_MANAGEMENT_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to create user', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
// DELETE: Delete a user
export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Prevent super admin from deleting themselves or other super admins
    const userToDelete = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!userToDelete) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
     if (userToDelete.role === Role.SUPER_ADMIN) {
       return NextResponse.json({ error: 'Cannot delete Super Admin users' }, { status: 403 });
    }
     if (id === admin.id) {
       return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_USER_MANAGEMENT_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete user', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}