import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getTokenFromRequest(req, 'admin_token');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.passKey !== undefined) updateData.passKey = body.passKey;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const subAdmin = await prisma.subAdmin.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: subAdmin });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update sub admin' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getTokenFromRequest(req, 'admin_token');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.subAdmin.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Sub admin deleted' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete sub admin' },
      { status: 500 }
    );
  }
}
