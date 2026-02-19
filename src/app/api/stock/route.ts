import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRCode } from '@/lib/utils';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user =
      getTokenFromRequest(req, 'admin_token') ||
      getTokenFromRequest(req, 'subadmin_token');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const tileId = searchParams.get('tileId');

    const where = tileId ? { tileId } : {};
    const logs = await prisma.stockLog.findMany({
      where,
      include: { tile: { select: { name: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock logs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req, 'admin_token');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — admin access required' },
        { status: 401 }
      );
    }

    const { tileId, type, quantity, note } = await req.json();

    if (!tileId || !type || !quantity) {
      return NextResponse.json(
        { success: false, error: 'tileId, type and quantity are required' },
        { status: 400 }
      );
    }

    const validTypes = ['ADD', 'REDUCE', 'ADJUSTMENT'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type must be ADD, REDUCE, or ADJUSTMENT' },
        { status: 400 }
      );
    }

    const tile = await prisma.tile.findUnique({ where: { id: tileId } });
    if (!tile) {
      return NextResponse.json(
        { success: false, error: 'Tile not found' },
        { status: 404 }
      );
    }

    const qty = parseInt(quantity);
    let newStock = tile.stockQty;

    if (type === 'ADD') {
      newStock += qty;
    } else if (type === 'REDUCE') {
      newStock = Math.max(0, newStock - qty);
    } else if (type === 'ADJUSTMENT') {
      newStock = qty;
    }

    // Regenerate QR after stock update
    const qrData = JSON.stringify({
      sku: tile.sku,
      name: tile.name,
      category: tile.category,
      size: tile.size,
      finish: tile.finish,
      color: tile.color,
      thickness: tile.thickness,
      pricePerBox: tile.pricePerBox,
    });
    const qrCode = await generateQRCode(qrData);

    const [log] = await prisma.$transaction([
      prisma.stockLog.create({
        data: {
          tileId,
          type,
          quantity: qty,
          note: note || null,
          doneBy: user.username as string,
        },
        include: { tile: { select: { name: true, sku: true } } },
      }),
      prisma.tile.update({
        where: { id: tileId },
        data: { stockQty: newStock, qrCode },
      }),
    ]);

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}
