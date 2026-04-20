import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// 1. Define protected and public routes
const protectedRoutes = [
  "/dashboard",
  "/account",
  "/orders",
  "/wishlist",
  "/checkout",
];

const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/products",
];

const authRoutes = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password"];

// 2. For Next.js 16+, use 'proxy' export
// For Next.js 13-15, use 'middleware' export instead
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 3. Check if current route is protected or public
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  try {
    // 4. Get session - only check cookie for performance
    // For full validation, use auth.api.getSession instead (slower)
    const sessionCookie = request.cookies.get("auth.session");

    // 5. Redirect logic
    if (isProtectedRoute && !sessionCookie) {
      // User trying to access protected route without auth
      const signInUrl = new URL("/auth/sign-in", request.url);
      signInUrl.searchParams.set("from", path);
      return NextResponse.redirect(signInUrl);
    }

    if (isAuthRoute && sessionCookie) {
      // Authenticated user trying to access auth pages - redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 6. Allow request to continue
    return NextResponse.next();
  } catch (error) {
    console.error("[proxy Error]:", error);
    // On error, allow request to continue
    // Full validation will happen in page components
    return NextResponse.next();
  }
}

// 7. Configure which routes proxy should run on
// Exclude static files, API routes, and other Next.js internals
export const config = {
  matcher: [
    // Run proxy on all routes except:
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};