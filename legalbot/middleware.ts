import { NextRequest, NextResponse } from "next/server";

// Public routes that do NOT require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/chat", "/emergency", "/rights", "/tourist"];

// Routes that should redirect to /dashboard if already logged in
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check session cookie (set by client after login)
  const session = request.cookies.get("legalbot_session")?.value;
  const isLoggedIn = !!session;

  // If user is logged in and tries to access auth pages → redirect to dashboard
  if (isLoggedIn && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is NOT logged in and tries to access protected routes → redirect to login
  if (!isLoggedIn && !PUBLIC_ROUTES.includes(pathname)) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
