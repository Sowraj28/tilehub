import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { sku: string } },
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

    const tile = await prisma.tile.findUnique({
      where: { sku: params.sku },
    });

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
