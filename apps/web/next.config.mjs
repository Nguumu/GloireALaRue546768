/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tcg/ui", "@tcg/database", "@tcg/tcg-core", "@tcg/types", "@tcg/utils"],
  images: {
    // Card art is hosted externally (set as printings are synced); keep this
    // list tight and add hosts deliberately rather than allowing any origin.
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
