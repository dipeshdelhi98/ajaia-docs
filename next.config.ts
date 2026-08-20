import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "mammoth"],
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingIncludes: {
    "*": ["./prisma/seeded.db"],
  },
};

export default nextConfig;
