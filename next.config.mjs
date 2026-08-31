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
      }
    ];
  }
};

export default nextConfig;
