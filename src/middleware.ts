import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

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

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<SessionResponse>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const role = session?.user?.role;

  if (!session) {
    return NextResponse.redirect(new URL("/api/login", request.url));
  }

  if (pathname === "/dashboard") {
    if (role === "admin") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    if (role === "seller") return NextResponse.redirect(new URL("/dashboard/seller", request.url));
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }

  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    pathname.startsWith("/dashboard/seller") &&
    role !== "seller" &&
    role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
