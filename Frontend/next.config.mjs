/**
 * Next.js configuration with strict mode and SWC minification.
 * Architectural decision: appDir enabled for modern routing and layouts.
 */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};

export default nextConfig;

