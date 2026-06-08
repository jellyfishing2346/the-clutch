import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  transpilePackages: ['shared'],
  webpack(config) {
    config.resolve.alias['shared'] = path.resolve(__dirname, '../../packages/shared/src/index.ts')
    return config
  },
}

export default nextConfig
