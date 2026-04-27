import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {
  turbopack: {}, // ← sagt Turbopack "ich weiss was ich tue", suppressed den Error
};

export default withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production", // ← kein Serwist im Dev-Modus
})(nextConfig);