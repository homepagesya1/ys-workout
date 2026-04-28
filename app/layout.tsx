import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "YS.Workout",
  description: "Track your workouts",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YS.Workout",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#09090F" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-dark-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-dark-512.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body>
        {/* 'obsidian' = Fallback falls localStorage leer ist */}
        <ThemeProvider scheme="obsidian" />
        {children}
      </body>
    </html>
  );
}