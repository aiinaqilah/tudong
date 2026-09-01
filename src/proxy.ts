import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

const protectedRoutes = ["/dashboard", "/checkout"];
const authRoutes = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password"];

type SessionUser = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

type SessionResponse = {
  session: { id: string; userId: string; expiresAt: string };
  user: SessionUser;
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Validate the session server-side (not just cookie presence)
  const { data: session } = await betterFetch<SessionResponse>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    }
  );

  if (isProtectedRoute && !session) {
    const signInUrl = new URL("/api/login", request.url);
    signInUrl.searchParams.set("from", path);
    return NextResponse.redirect(signInUrl);
  }

  if (path === "/dashboard" && session) {
    const role = session.user.role;
    if (role === "admin")
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    if (role === "seller")
      return NextResponse.redirect(new URL("/dashboard/seller", request.url));
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }

  if (path.startsWith("/dashboard/admin") && session) {
    if (session.user.role !== "admin")
      return NextResponse.redirect(new URL("/", request.url));
  }

  if (path.startsWith("/dashboard/seller") && session) {
    const role = session.user.role;
    if (role !== "seller" && role !== "admin")
      return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|studio|public).*)",
  ],
};
