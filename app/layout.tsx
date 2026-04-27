import type { Metadata } from "next";
import "./globals.css";

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
        <meta name="theme-color" content="#0a0a0a" />
        {/* iOS Touch Icons — Safari liest diese direkt */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-dark-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-dark-512.png" />
        {/* Viewport für Safe Areas (Notch/Dynamic Island) */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}