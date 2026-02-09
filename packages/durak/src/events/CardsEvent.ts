import { Card } from "../models/Card";

export type CardsEvent = {
    cards: Card[];
    add?: boolean;
};

export function parseCardsEvent(element: Element): CardsEvent {
    const valuesAttr = element.getAttribute("values") ?? "";
    const addAttr = element.getAttribute("add") ?? "";
    const values = parseCards(valuesAttr);
    if (values.length > 0) {
        return {
            cards: values,
            add: false
        };
    }

    const added = parseCards(addAttr);
    return {
        cards: added,
        add: added.length > 0
    };
}

function parseCards(value: string): Card[] {
    if (!value) {
        return [];
    }
    return value.split(",").map((item) => Card.parse(item.trim()));
}
