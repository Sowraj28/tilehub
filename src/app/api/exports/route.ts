import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const subAdminUser = getTokenFromRequest(req, 'subadmin_token');
    const adminUser = getTokenFromRequest(req, 'admin_token');

    if (!subAdminUser && !adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Sub admins only see their own exports; admins see all
    const where = subAdminUser
      ? { subAdminId: subAdminUser.id as string }
      : {};

    const exports = await prisma.export.findMany({
      where,
      include: {
        subAdmin: { select: { displayName: true, username: true } },
        items: { include: { tile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: exports });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exports' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const subAdminUser = getTokenFromRequest(req, 'subadmin_token');
    if (!subAdminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — sub admin access required' },
        { status: 401 }
      );
    }

    const { items, note } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'items array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Fetch all involved tiles
    const tileIds = items.map((i: { tileId: string }) => i.tileId);
    const tiles = await prisma.tile.findMany({ where: { id: { in: tileIds } } });
    const tileMap = new Map(tiles.map((t) => [t.id, t]));

    let totalBoxes = 0;
    let totalValue = 0;
    const exportItems: { tileId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const tile = tileMap.get(item.tileId);
      if (!tile) continue;
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) continue;
      totalBoxes += qty;
      totalValue += qty * tile.pricePerBox;
      exportItems.push({
        tileId: item.tileId,
        quantity: qty,
        price: tile.pricePerBox,
      });
    }

    if (exportItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid items to export' },
        { status: 400 }
      );
    }

    // Create export and deduct stock atomically
    const stockUpdates = exportItems.flatMap((item) => {
      const tile = tileMap.get(item.tileId);
      if (!tile) return [];
      const newStock = Math.max(0, tile.stockQty - item.quantity);
      return [
        prisma.tile.update({
          where: { id: item.tileId },
          data: { stockQty: newStock },
        }),
        prisma.stockLog.create({
          data: {
            tileId: item.tileId,
            type: 'SALE',
            quantity: item.quantity,
            note: `Sale export by ${subAdminUser.username} — Export bill`,
            doneBy: subAdminUser.username as string,
          },
        }),
      ];
    });

    const [exportRecord] = await prisma.$transaction([
      prisma.export.create({
        data: {
          subAdminId: subAdminUser.id as string,
          totalBoxes,
          totalValue,
          note: note || null,
          items: { create: exportItems },
        },
        include: {
          items: { include: { tile: true } },
          subAdmin: { select: { displayName: true, username: true } },
        },
      }),
      ...stockUpdates,
    ]);

    return NextResponse.json({ success: true, data: exportRecord }, { status: 201 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create export' },
      { status: 500 }
    );
  }
}
