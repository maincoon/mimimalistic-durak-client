import { Card } from "./Card";
import { CardSuit } from "./CardSuit";
import { Box, parseBox } from "./Box";
import { RoundInfo, parseRoundInfo } from "./RoundInfo";

export type TableState = {
    trump?: CardSuit;
    trumpCard?: Card;
    winCard?: Card;
    deckCount?: number;
    boxes: Box[];
    round?: RoundInfo;
};

export function parseTableState(element: Element): TableState {
    const boxes = Array.from(element.getElementsByTagName("box")).map((node) =>
        parseBox(node)
    );
    const roundElement = element.querySelector("info");
    const cardsElement = element.querySelector("cards");
    const trumpRaw = (element.getAttribute("trump") ?? cardsElement?.getAttribute("trump") ?? "").trim();
    const winRaw = (element.getAttribute("win_card") ?? cardsElement?.getAttribute("win_card") ?? "").trim();
    const deckRaw = element.getAttribute("deck_count") ?? cardsElement?.getAttribute("deck_count");
    const trumpCard = trumpRaw.length > 1 ? Card.parse(trumpRaw) : undefined;

    return {
        trump: trumpCard ? trumpCard.suit : (trumpRaw || undefined) as CardSuit | undefined,
        trumpCard,
        winCard: winRaw.length > 1 ? Card.parse(winRaw) : undefined,
        deckCount: parseOptionalNumber(deckRaw),
        boxes,
        round: roundElement ? parseRoundInfo(roundElement) : undefined
    };
}

function parseOptionalNumber(value: string | null): number | undefined {
    if (value === null || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
