import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = new URL("../../", import.meta.url);

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@updau/core": fileURLToPath(new URL("packages/core/src", root)),
            "@updau/protocol": fileURLToPath(new URL("packages/protocol/src", root)),
            "@updau/transport": fileURLToPath(new URL("packages/transport/src", root)),
            "@updau/durak": fileURLToPath(new URL("packages/durak/src", root))
        }
    },
    server: {
        port: 5173
    }
});
