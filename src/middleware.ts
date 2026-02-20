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

  // ── Admin routes ──────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;
    const valid = token ? isTokenValid(token) : false;

    // Already authenticated → block access to login page, send to dashboard
    if (pathname.startsWith("/admin/login")) {
      if (valid) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Protected admin pages → require valid token
    if (!valid) {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      if (token) response.cookies.delete("admin_token");
      return response;
    }
  }

  // ── Sub-Admin routes ──────────────────────────────────────────
  if (pathname.startsWith("/subadmin")) {
    const token = request.cookies.get("subadmin_token")?.value;
    const valid = token ? isTokenValid(token) : false;

    // Already authenticated → block access to login page, send to dashboard
    if (pathname.startsWith("/subadmin/login")) {
      if (valid) {
        return NextResponse.redirect(
          new URL("/subadmin/dashboard", request.url),
        );
      }
      return NextResponse.next();
    }

    // Protected sub-admin pages → require valid token
    if (!valid) {
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
