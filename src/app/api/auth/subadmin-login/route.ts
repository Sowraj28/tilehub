import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, passKey } = await req.json();

    if (!username || !passKey) {
      return NextResponse.json(
        { success: false, error: 'Username and pass key required' },
        { status: 400 }
      );
    }

    const subAdmin = await prisma.subAdmin.findUnique({ where: { username } });

    if (!subAdmin || !subAdmin.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account not found or inactive' },
        { status: 401 }
      );
    }

    if (subAdmin.passKey !== passKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid pass key' },
        { status: 401 }
      );
    }

    const token = signToken({
      id: subAdmin.id,
      username: subAdmin.username,
      displayName: subAdmin.displayName,
      role: 'SUB_ADMIN',
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: subAdmin.id,
        username: subAdmin.username,
        displayName: subAdmin.displayName,
      },
    });

    response.cookies.set('subadmin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('SubAdmin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
