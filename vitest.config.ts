import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const protocolPath = fileURLToPath(
    new URL("./packages/protocol/src", import.meta.url)
);
const transportPath = fileURLToPath(
    new URL("./packages/transport/src", import.meta.url)
);
const corePath = fileURLToPath(new URL("./packages/core/src", import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            "@updau/protocol": protocolPath,
            "@updau/transport": transportPath,
            "@updau/core": corePath
        }
    },
    test: {
        include: ["**/__tests__/**/*.test.ts"],
        environment: "jsdom"
    }
});
