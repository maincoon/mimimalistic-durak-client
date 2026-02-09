import { describe, expect, it } from "vitest";
import { ReconnectStrategy } from "../src/ReconnectStrategy";

describe("ReconnectStrategy", () => {
    it("returns exponential delays with a cap", () => {
        const strategy = new ReconnectStrategy({
            baseDelayMs: 1000,
            maxDelayMs: 5000,
            multiplier: 2
        });

        expect(strategy.nextDelay()).toBe(1000);
        expect(strategy.nextDelay()).toBe(2000);
        expect(strategy.nextDelay()).toBe(4000);
        expect(strategy.nextDelay()).toBe(5000);
    });

    it("resets attempt counter", () => {
        const strategy = new ReconnectStrategy({ baseDelayMs: 1000 });
        strategy.nextDelay();
        strategy.nextDelay();
        strategy.reset();
        expect(strategy.nextDelay()).toBe(1000);
    });
});
