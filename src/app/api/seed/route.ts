import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// POST /api/seed — Creates the initial super admin account
// Run this ONCE after setting up your database, then optionally delete this file
export async function POST() {
  try {
    const existing = await prisma.admin.findUnique({
      where: { username: 'superadmin' },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Super admin already exists. Delete this route after setup.' },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash('Admin@123', 12);
    const admin = await prisma.admin.create({
      data: {
        username: 'superadmin',
        password: hashed,
        role: 'SUPER_ADMIN',
      },
    });

    return NextResponse.json({
      success: true,
      message: '✅ Super admin created successfully!',
      credentials: {
        username: 'superadmin',
        password: 'Admin@123',
        loginUrl: '/admin/login',
      },
      warning: '⚠️ DELETE this /api/seed route after your first login for security!',
      data: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Seed failed. Check your DATABASE_URL in .env.local' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: 'Send a POST request to this endpoint to create the super admin account.',
    credentials: { username: 'superadmin', password: 'Admin@123' },
    note: 'Use curl or a REST client: curl -X POST http://localhost:3000/api/seed',
  });
}
