/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/team',
        destination: '/masters',
        permanent: false,
      },
      {
        source: '/access-control',
        destination: '/masters',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
