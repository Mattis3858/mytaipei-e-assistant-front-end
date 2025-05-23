/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "gyvxrvhdtojwnyeedyiz.supabase.co", // Add your Supabase domain here
      // If you have other external image domains, add them here too
    ],
  },
  // Other Next.js configurations can go here
};

export default nextConfig;
