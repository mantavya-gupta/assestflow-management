import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pin the workspace root explicitly. Without this, Turbopack walks up the
// directory tree looking for lockfiles and can latch onto an unrelated one
// higher up (e.g. an orphaned package-lock.json in a home directory), which
// makes it treat that whole tree as the project root — at best a confusing
// warning, at worst Turbopack watching/resolving far more of the filesystem
// than intended. This repo's real root is one level up from /frontend,
// where package-lock.json and node_modules actually live.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The browser needs to be allowed to call the backend API directly
// (auth forms, dashboard data) — a bare `connect-src 'self'` blocks
// every one of those cross-origin fetch calls.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' ${apiUrl};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
