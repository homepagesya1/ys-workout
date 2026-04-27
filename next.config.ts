import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {};

export default withSerwist({
  swSrc: "app/sw.ts",        // dein Service Worker Source
  swDest: "public/sw.js",    // output (von Next.js automatisch served)
})(nextConfig);