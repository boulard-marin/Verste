import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user's home folder would otherwise be
  // picked up as the workspace root.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
