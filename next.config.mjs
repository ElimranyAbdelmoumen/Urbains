/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**', // Permet les images depuis n'importe quel domaine HTTPS
      },
    ],
  },
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  // Configuration pour EC2
  output: 'standalone', // Optimise le build pour la production
};

export default nextConfig;



