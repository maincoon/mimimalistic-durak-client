import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const root = new URL("../../", import.meta.url);

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            devOptions: {
                enabled: true
            },
            manifest: {
                name: "UpDAU Durak",
                short_name: "Durak",
                description: "Minimalistic Durak Card Game",
                theme_color: "#ffffff",
                background_color: "#ffffff",
                display: "standalone",
                icons: [
                    {
                        src: "icon.svg",
                        sizes: "any",
                        type: "image/svg+xml"
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            "@updau/core": fileURLToPath(new URL("packages/core/src", root)),
            "@updau/protocol": fileURLToPath(new URL("packages/protocol/src", root)),
            "@updau/transport": fileURLToPath(new URL("packages/transport/src", root)),
            "@updau/durak": fileURLToPath(new URL("packages/durak/src", root))
        }
    },
    server: {
        host: "0.0.0.0",
        port: 5173
    }
});
