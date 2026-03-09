import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Derive remotePattern from NEXT_PUBLIC_API_URL so production image hosts are
// allowed automatically without hardcoding hostnames.
function buildApiRemotePattern(url: string): import("next/dist/shared/lib/image-config").RemotePattern {
  const parsed = new URL(url);
  const isHttps = parsed.protocol === "https:";
  const base: import("next/dist/shared/lib/image-config").RemotePattern = {
    protocol: isHttps ? "https" : "http",
    hostname: parsed.hostname,
    pathname: "/**",
  };
  if (parsed.port) {
    base.port = parsed.port;
  }
  return base;
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Always allow localhost dev server
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      // Allow the host derived from NEXT_PUBLIC_API_URL (covers production)
      buildApiRemotePattern(apiUrl),
      // Broad fallback for any HTTPS host (e.g. CDN, external image services)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
