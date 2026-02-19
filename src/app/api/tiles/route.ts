import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQRCode, generateSKU } from "@/lib/utils";
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
  } catch (error) {
    console.error("Fetch tiles error:", error);
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
      thickness,
      pricePerBox,
      stockQty,
      minStock,
      description,
      imageUrl, // ← NEW
    } = body;

    if (
      !name ||
      !category ||
      !size ||
      !finish ||
      !color ||
      !thickness ||
      !pricePerBox
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Required fields: name, category, size, finish, color, thickness, pricePerBox",
        },
        { status: 400 },
      );
    }

    const sku = generateSKU(name, category);
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
    const qrCode = await generateQRCode(qrData);

    const tile = await prisma.tile.create({
      data: {
        name,
        sku,
        category,
        size,
        finish,
        color,
        thickness,
        pricePerBox: parseFloat(pricePerBox),
        stockQty: parseInt(stockQty) || 0,
        minStock: parseInt(minStock) || 10,
        qrCode,
        description: description || null,
        imageUrl: imageUrl || null, // ← NEW
      },
    });

    if (tile.stockQty > 0) {
      await prisma.stockLog.create({
        data: {
          tileId: tile.id,
          type: "ADD",
          quantity: tile.stockQty,
          note: "Initial stock on tile creation",
          doneBy: user.username as string,
        },
      });
    }

    return NextResponse.json({ success: true, data: tile }, { status: 201 });
  } catch (error) {
    console.error("Create tile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create tile" },
      { status: 500 },
    );
  }
}
