import { describe, expect, it } from "vitest";
import { ChannelState } from "../src/channel/ChannelState";
import { StateMachine, defaultChannelTransitions } from "../src/state/StateMachine";

describe("StateMachine", () => {
    it("allows known transitions", () => {
        const machine = new StateMachine(defaultChannelTransitions);
        expect(machine.canTransition(ChannelState.FREE, ChannelState.FIND)).toBe(true);
    });

    it("throws on invalid transitions", () => {
        const machine = new StateMachine(defaultChannelTransitions);
        expect(() => machine.transition(ChannelState.FREE, ChannelState.LEAVE)).toThrow();
    });
});
