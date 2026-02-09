import { describe, expect, it } from "vitest";
import { StateRecovery } from "../src/state/StateRecovery";

const channel = (pub: string, state: string) => ({ pub, state });

describe("StateRecovery", () => {
    it("prefers game state", () => {
        const result = StateRecovery.fromChannels([
            channel("a", "find"),
            channel("b", "game")
        ]);
        expect(result.mode).toBe("PLAYING");
        expect(result.pub).toBe("b");
    });

    it("falls back to free", () => {
        const result = StateRecovery.fromChannels([]);
        expect(result.mode).toBe("FREE");
    });
});
