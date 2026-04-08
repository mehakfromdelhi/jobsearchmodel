import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  outputFileTracingRoot: path.join(import.meta.dirname, "..")
};

export default nextConfig;
