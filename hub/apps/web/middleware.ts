import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  if (hostname.includes("paranagamejam.com.ar")) {
    const url = request.nextUrl.clone();
    if (!url.pathname.startsWith("/jam")) {
      url.pathname = `/jam${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  return undefined;
}

export const config = {
  matcher: ["/:path*"],
};
