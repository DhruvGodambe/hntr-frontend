/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/vault",
        destination: "/marketplace",
        permanent: true
      },
      {
        source: "/learn/index.html",
        destination: "/learn",
        permanent: false
      },
      {
        // Admin moved to the standalone hntr-admin app — hide this route without deleting it.
        source: "/admin",
        destination: "/",
        permanent: false
      },
      {
        source: "/admin/:path*",
        destination: "/",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
