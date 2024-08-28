/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/sosialhjelp/avtaler-admin",
  output: "standalone",
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://cdn.nav.no/teamdigisos/sosialhjelp-avtaler-admin"
      : undefined,
};

export default nextConfig;
