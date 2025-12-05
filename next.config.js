/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "6069",
        pathname: "/avatar/images/**",
      },
    ],
  },

  // ⭐⭐⭐ FIX LỖI bufferutil & utf-8-validate ⭐⭐⭐
  webpack: (config, { isServer }) => {
    // Tắt hai module optional để tránh lỗi compile
    config.resolve.alias = {
      ...config.resolve.alias,
      bufferutil: false,
      "utf-8-validate": false,
    };

    return config;
  },
};

module.exports = nextConfig;
