import { buildCspHeader } from "@navikt/nav-dekoratoren-moduler/ssr/index.js";

const appDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-eval'",
    "https://uxsignals-frontend.uxsignals.app.iterate.no",
  ],
  "script-src-elem": [
    "'self'",
    "https://uxsignals-frontend.uxsignals.app.iterate.no",
  ],
  "style-src": ["'self'"],
  "img-src": ["'self'", "data:"],
  "font-src": ["'self'", "https://cdn.nav.no"],
  "worker-src": ["'self'"],
  "connect-src": ["'self'", "https://*.nav.no", "https://*.uxsignals.com"],
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const environment =
      process.env.NEXT_PUBLIC_RUNTIME_ENVIRONMENT === "prod" ? "prod" : "dev";
    const cspValue = await buildCspHeader(appDirectives, { env: environment });
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspValue,
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
  basePath: "/sosialhjelp/avtaler-admin",
  output: "standalone",
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://cdn.nav.no/teamdigisos/sosialhjelp-innsyn"
      : undefined,
};

export default nextConfig;
