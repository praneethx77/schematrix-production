/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Keep these server packages external so they use the real Node.js runtime
  // (native DNS resolver, bcrypt, etc.) instead of a webpack-bundled shim.
  serverExternalPackages: ['mongodb', 'bcryptjs'],
  experimental: {
    cpus: 1,
  },
}

export default nextConfig
