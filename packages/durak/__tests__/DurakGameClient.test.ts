import { describe, expect, it } from "vitest";
import { DurakGameClient } from "../src/DurakGameClient";
import { parseCardsEvent } from "../src/events/CardsEvent";

const parseElement = (xml: string) =>
    new DOMParser().parseFromString(xml, "text/xml").documentElement;

describe("DurakGameClient", () => {
    it("updates hand on cards event", () => {
        const client = new DurakGameClient();
        const event = parseCardsEvent(parseElement("<cards values=\"6d,7d\"/>") as Element);
        client.handleCards(event);
        expect(client.state.hand.length).toBe(2);
    });
});
