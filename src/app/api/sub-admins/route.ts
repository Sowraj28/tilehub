import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req, 'admin_token');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subAdmins = await prisma.subAdmin.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        passKey: true,
        displayName: true,
        isActive: true,
        createdBy: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: subAdmins });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sub admins' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req, 'admin_token');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { username, passKey, displayName } = await req.json();

    if (!username || !passKey || !displayName) {
      return NextResponse.json(
        { success: false, error: 'username, passKey, and displayName are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.subAdmin.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Username already exists. Choose a different username.' },
        { status: 409 }
      );
    }

    const subAdmin = await prisma.subAdmin.create({
      data: {
        username,
        passKey,
        displayName,
        createdBy: user.username as string,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: subAdmin.id,
          username: subAdmin.username,
          displayName: subAdmin.displayName,
          isActive: subAdmin.isActive,
          createdBy: subAdmin.createdBy,
          createdAt: subAdmin.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create sub admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sub admin' },
      { status: 500 }
    );
  }
}
