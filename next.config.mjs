/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false
      }
    ]
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '1000mb' // Set the body size limit to 2 MB
    }
  }
}

export default nextConfig
