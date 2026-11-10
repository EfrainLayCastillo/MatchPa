import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const GOOGLE_TAG = "https://www.googletagmanager.com";
const GOOGLE_ANALYTICS = ["https://*.google-analytics.com", "https://*.analytics.google.com"];

/** Absolute API origin only exists locally; in production `/api` is a same-origin rewrite. */
function apiOrigin(): string[] {
  const url = process.env.NEXT_PUBLIC_API_URL ?? "";
  return url.startsWith("http") ? [new URL(url).origin] : [];
}

function buildCsp(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", GOOGLE_TAG, ...(isDev ? ["'unsafe-eval'"] : [])],
    "connect-src": ["'self'", ...apiOrigin(), GOOGLE_TAG, ...GOOGLE_ANALYTICS],
    "img-src": ["'self'", "data:", "blob:", GOOGLE_TAG, ...GOOGLE_ANALYTICS],
    "style-src": ["'self'", "'unsafe-inline'"],
    "font-src": ["'self'"],
    "worker-src": ["'self'"],
    "manifest-src": ["'self'"],
    "frame-src": [GOOGLE_TAG],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives)
    .map(([name, sources]) => `${name} ${sources.join(" ")}`)
    .join("; ");
}

/** HSTS comes from Vercel. Report-Only CSP ignores frame-ancestors, so X-Frame-Options does the blocking. */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
  { key: "Content-Security-Policy-Report-Only", value: buildCsp() },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  outputFileTracingIncludes: {
    "/partidos/[code]/historia": ["./assets/fonts/**", "./public/logo/logo.svg", "./public/static/**"],
  },
  partialPrefetching: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL;
    if (!backend) return [];
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/__transmit/:path*", destination: `${backend}/__transmit/:path*` },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
