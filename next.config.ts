import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ['ryvpqbuftmlsynmajecx.supabase.co'], // Supabase Storage
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://*.telegram.org https://vercel.live https://*.vercel.app https://challenges.cloudflare.com https://*.tradingview.com",
              "style-src 'self' 'unsafe-inline' https://*.tradingview.com",
              "img-src 'self' data: blob: https://*.supabase.co https://telegram.org https://*.telegram.org https://grainy-gradients.vercel.app https://*.tradingview.com",
              "font-src 'self' data: https://*.tradingview.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel.app https://vercel.live wss://*.vercel.live https://api.coingecko.com wss://stream.binance.com:9443 wss://stream.binance.com wss://*.tradingview.com https://*.tradingview.com wss://ws.okx.com:8443 https://api.binance.com",
              "frame-src 'self' https://telegram.org https://*.telegram.org https://challenges.cloudflare.com https://*.tradingview.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self' https://telegram.org https://*.telegram.org"
            ].join('; ')
          }
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/en/admin/dashboard',
        permanent: true,
      },
      {
        source: '/:locale/dashboard/referrals',
        destination: '/:locale/dashboard/affiliate',
        permanent: true,
      },
      {
        source: '/:locale/dashboard/rewards',
        destination: '/:locale/dashboard/affiliate',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:locale/auth/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/:path*`,
      },
      {
        source: '/auth/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/:path*`,
      },
    ];
  },
};

// Wrap with Sentry for error tracking
export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "apex-os",
  project: "apex-os-saas",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
