/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { mdxRs: true },
  // prevents Turbo from externalizing ESM next-mdx-remote
  transpilePackages: ['next-mdx-remote'],
  reactStrictMode: true
};
export default nextConfig;
