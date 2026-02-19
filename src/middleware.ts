import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJWT(token: string): { exp?: number; id?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const padded =
      payload +
      "==".slice((payload.length + 2) % 3 === 0 ? 2 : (payload.length + 2) % 3);
    const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return false;
  if (!payload.id) return false;
  if (payload.exp && Date.now() / 1000 > payload.exp) return false;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !isTokenValid(token)) {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      if (token) response.cookies.delete("admin_token");
      return response;
    }
  }

  if (
    pathname.startsWith("/subadmin") &&
    !pathname.startsWith("/subadmin/login")
  ) {
    const token = request.cookies.get("subadmin_token")?.value;
    if (!token || !isTokenValid(token)) {
      const response = NextResponse.redirect(
        new URL("/subadmin/login", request.url),
      );
      if (token) response.cookies.delete("subadmin_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/subadmin/:path*"],
};
