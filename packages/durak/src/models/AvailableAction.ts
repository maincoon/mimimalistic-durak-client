import { Card } from "./Card";
import { AvailableActionType } from "./AvailableActionType";

export type AvailableAction = {
    type: AvailableActionType;
    cards: Card[];
    pairs?: { attack: Card; defend: Card }[];
};

export function parseAvailableAction(element: Element): AvailableAction {
    const typeValue = element.getAttribute("type") ?? "";
    const cardsValue = element.getAttribute("cards") ?? "";

    const { cards, pairs } = parseCards(cardsValue);

    return {
        type: typeValue as AvailableActionType,
        cards,
        pairs: pairs.length ? pairs : undefined
    };
}

function parseCards(value: string): { cards: Card[]; pairs: { attack: Card; defend: Card }[] } {
    if (!value) {
        return { cards: [], pairs: [] };
    }
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    const cards: Card[] = [];
    const pairs: { attack: Card; defend: Card }[] = [];
    for (const item of items) {
        const pair = item
            .split("-")
            .map((part) => part.trim())
            .filter((part) => part && part.toLowerCase() !== "none");

        if (pair.length === 1) {
            cards.push(Card.parse(pair[0]));
            continue;
        }

        if (pair.length >= 2) {
            const attack = Card.parse(pair[0]);
            const defend = Card.parse(pair[1]);
            pairs.push({ attack, defend });
            cards.push(attack, defend);
        }
    }
    return { cards, pairs };
}
