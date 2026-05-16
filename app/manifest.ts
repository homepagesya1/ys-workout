import { MetadataRoute } from "next";
import { cookies } from "next/headers";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const cookieStore = await cookies();
    const iconTheme = cookieStore.get("pwa-icon-theme")?.value ?? "dark";

    // Icon-Pfade je nach Theme
    const iconBase =
        iconTheme === "custom"
            ? "/icon-custom"
            : iconTheme === "light"
                ? "/icon-light"
                : "/icon-dark";

    return {
        name: "YS.Workout",
        short_name: "YS.Workout",
        description: "Track your workouts",
        start_url: "/routines",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        icons: [
            { src: `${iconBase}-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
            { src: `${iconBase}-192.png`, sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: `${iconBase}-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
            { src: `${iconBase}-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
    };
}