import { Card } from "./Card";

export type Box = {
    id: number;
    cardCount: number;
    addCount?: number;
    cards?: Card[];
};

export function parseBox(element: Element): Box {
    return {
        id: parseNumber(element.getAttribute("id")),
        cardCount: parseNumber(element.getAttribute("count")),
        addCount: parseOptionalNumber(element.getAttribute("add")),
        cards: undefined
    };
}

function parseNumber(value: string | null): number {
    const parsed = Number(value ?? "0");
    return Number.isNaN(parsed) ? 0 : parsed;
}

function parseOptionalNumber(value: string | null): number | undefined {
    if (value === null || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
