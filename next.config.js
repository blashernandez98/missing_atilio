/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'elasticbeanstalk-us-east-1-911267631614.s3.amazonaws.com',
        pathname: '/imagenes/jugadores/**',
      },
    ],
  },
  async redirects() {
    // Block admin panel in production
    if (process.env.NEXT_PUBLIC_ENABLE_ADMIN !== 'true') {
      return [
        {
          source: '/admin/:path*',
          destination: '/404',
          permanent: false,
        },
      ];
    }
    return [];
  },
}

module.exports = nextConfig
