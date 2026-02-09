import { describe, expect, it } from "vitest";
import { Card } from "../src/models/Card";
import { CardRank } from "../src/models/CardRank";
import { CardSuit } from "../src/models/CardSuit";

describe("Card", () => {
    it("parses and formats cards", () => {
        const card = Card.parse("10c");
        expect(card.rank).toBe(CardRank.TEN);
        expect(card.suit).toBe(CardSuit.CLUBS);
    });

    it("parses cards with mixed case", () => {
        const card1 = Card.parse("8D");
        expect(card1.rank).toBe(CardRank.EIGHT);
        expect(card1.suit).toBe(CardSuit.DIAMONDS);

        const card2 = Card.parse("tH");
        expect(card2.rank).toBe(CardRank.TEN);
        expect(card2.suit).toBe(CardSuit.HEARTS);
    });
});
