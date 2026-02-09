import { Card } from "./Card";
import { TurnAction } from "./TurnAction";

export type TurnInfo = {
    box: number;
    action: TurnAction;
    card?: Card;
    attackCard?: Card;
    defendCard?: Card;
};

export function parseTurnInfo(element: Element): TurnInfo {
    const card = element.getAttribute("card");
    const attackCard = element.getAttribute("attack_card");
    const defendCard = element.getAttribute("defend_card");

    return {
        box: parseNumber(element.getAttribute("box")),
        action: (element.getAttribute("action") ?? "") as TurnAction,
        card: card ? Card.parse(card) : undefined,
        attackCard: attackCard ? Card.parse(attackCard) : undefined,
        defendCard: defendCard ? Card.parse(defendCard) : undefined
    };
}

function parseNumber(value: string | null): number {
    const parsed = Number(value ?? "0");
    return Number.isNaN(parsed) ? 0 : parsed;
}
