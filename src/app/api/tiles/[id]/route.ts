// app/api/tiles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQRCode } from "@/lib/utils";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const tile = await prisma.tile.findUnique({ where: { id: params.id } });
    if (!tile) {
      return NextResponse.json(
        { success: false, error: "Tile not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: tile });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tile" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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
      minStock,
      description,
      imageUrl,
    } = body;

    const existing = await prisma.tile.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Tile not found" },
        { status: 404 },
      );
    }

    const updatedName = name || existing.name;
    const updatedCategory = category || existing.category;
    const updatedSize = size || existing.size;
    const updatedFinish = finish || existing.finish;
    const updatedColor = color || existing.color;
    const updatedThickness = thickness || existing.thickness;
    const updatedPrice = pricePerBox
      ? parseFloat(pricePerBox)
      : existing.pricePerBox;

    const updatedImageUrl = Object.prototype.hasOwnProperty.call(
      body,
      "imageUrl",
    )
      ? imageUrl || null
      : existing.imageUrl;

    // Regenerate QR with standard black-on-white colors
    const qrData = JSON.stringify({
      sku: existing.sku,
      name: updatedName,
      category: updatedCategory,
      size: updatedSize,
      finish: updatedFinish,
      color: updatedColor,
      thickness: updatedThickness,
      pricePerBox: updatedPrice,
    });
    const qrCode = await generateQRCode(qrData);

    const tile = await prisma.tile.update({
      where: { id: params.id },
      data: {
        name: updatedName,
        category: updatedCategory,
        size: updatedSize,
        finish: updatedFinish,
        color: updatedColor,
        thickness: updatedThickness,
        pricePerBox: updatedPrice,
        minStock: minStock ? parseInt(minStock) : existing.minStock,
        qrCode,
        description:
          description !== undefined ? description : existing.description,
        imageUrl: updatedImageUrl,
      },
    });

    return NextResponse.json({ success: true, data: tile });
  } catch (error) {
    console.error("Update tile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update tile" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getTokenFromRequest(req, "admin_token");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await prisma.tile.delete({ where: { id: params.id } });
    return NextResponse.json({
      success: true,
      message: "Tile deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete tile" },
      { status: 500 },
    );
  }
}
