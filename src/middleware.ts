import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for admin login and API routes
  if (path === "/admin/login" || path.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // For all other routes, you can keep your existing logic
  // This is a minimal version – customize as needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
