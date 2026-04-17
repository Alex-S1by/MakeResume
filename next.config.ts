/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: { resolve: { alias: { canvas: boolean; encoding: boolean; }; }; }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;