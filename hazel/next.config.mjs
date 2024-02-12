/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/u/:username",
      },
    ];
  },
};

export default nextConfig;
