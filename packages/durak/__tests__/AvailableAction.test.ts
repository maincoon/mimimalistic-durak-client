import { describe, expect, it } from "vitest";
import { parseAvailableAction } from "../src/models/AvailableAction";

describe("AvailableAction", () => {
    it("parses cards list", () => {
        const element = new DOMParser().parseFromString(
            "<available type=\"ATTACK\" cards=\"6d-7d,8h\"/>",
            "text/xml"
        ).documentElement;

        const action = parseAvailableAction(element);
        expect(action.cards.length).toBe(3);
    });
});
