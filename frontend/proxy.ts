import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function clientIp(request: NextRequest): string | null {
  // Vercel overwrites these headers; anywhere else the client can forge them.
  const real = request.headers.get("x-real-ip")?.trim();
  return real || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("x-client-ip");
  headers.delete("x-proxy-secret");

  const secret = process.env.PROXY_SECRET;
  const ip = clientIp(request);
  if (secret && ip) {
    headers.set("x-proxy-secret", secret);
    headers.set("x-client-ip", ip);
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/api/:path*", "/__transmit/:path*"],
};
