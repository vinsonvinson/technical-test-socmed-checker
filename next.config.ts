import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "yt3.ggpht.com",
            },
            {
                protocol: "https",
                hostname: "*.tiktokcdn.com",
            },
            {
                protocol: "https",
                hostname: "*.tiktokcdn-eu.com",
            },
            {
                protocol: "https",
                hostname: "*.tiktokcdn-us.com",
            },
            {
                protocol: "https",
                hostname: "*.cdninstagram.com",
            },
            {
                protocol: "https",
                hostname: "*.fbcdn.net",
            },
        ],
    },
};

export default nextConfig;
