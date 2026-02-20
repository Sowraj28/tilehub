// app/api/tiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQRCode } from "@/lib/utils";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user =
      getTokenFromRequest(req, "admin_token") ||
      getTokenFromRequest(req, "subadmin_token");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const tiles = await prisma.tile.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tiles });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tiles" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req, "admin_token");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      name,
      category,
      size,
      finish,
      color,
      thickness = "10mm",
      pricePerBox,
      stockQty = 0,
      minStock = 10,
      description,
      imageUrl,
    } = body;

    if (!name || !category || !size || !finish || !color || !pricePerBox) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate unique SKU
    const prefix = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const sku = `${prefix}-${timestamp}`;

    const qrData = JSON.stringify({
      sku,
      name,
      category,
      size,
      finish,
      color,
      thickness,
      pricePerBox: parseFloat(pricePerBox),
    });

    // Generate standard black-on-white QR code
    const qrCode = await generateQRCode(qrData);

    const tile = await prisma.tile.create({
      data: {
        sku,
        name,
        category,
        size,
        finish,
        color,
        thickness,
        pricePerBox: parseFloat(pricePerBox),
        stockQty: parseInt(stockQty) || 0,
        minStock: parseInt(minStock) || 10,
        description: description || null,
        imageUrl: imageUrl || null,
        qrCode,
      },
    });

    // If initial stock > 0, create a stock log
  await prisma.stockLog.create({
    data: {
      tileId: tile.id,
      type: "ADD",
      quantity: parseInt(stockQty),
      note: "Initial stock on tile creation",
      doneBy: "admin",
    },
  });

    return NextResponse.json({ success: true, data: tile }, { status: 201 });
  } catch (error) {
    console.error("Create tile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create tile" },
      { status: 500 },
    );
  }
}
