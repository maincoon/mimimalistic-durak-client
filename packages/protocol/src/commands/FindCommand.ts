import { XmlBuilder } from "../xml/XmlBuilder";

export type FindCriteria = {
    queue?: string;
    game?: string;
    currency?: string;
    players?: number | string;
    bet?: string;
    gameType?: string;
    numSeats?: number | string;
    cashBet?: string;
    points?: number | string;
    extras?: Record<string, string | number>;
};

export class FindCommand {
    static build(pub: string, criteria: FindCriteria): string {
        const extras = criteria.extras ?? {};
        const gameType = criteria.gameType ?? criteria.game;
        const numSeats = criteria.numSeats ?? criteria.players;
        const cashBet = criteria.cashBet ?? criteria.bet;

        if (criteria.queue) {
            const criteriaAttrs: Record<string, string | number | undefined> = {
                game_type: gameType,
                num_seats: numSeats,
                cash_bet: cashBet,
                points: criteria.points
            };
            const criteriaXml = XmlBuilder.element("criteria", criteriaAttrs);
            const queueXml = XmlBuilder.element("queue", { name: criteria.queue }, [criteriaXml]);
            return XmlBuilder.buildRequest("find", { pub }, [queueXml]);
        }

        const hasLegacyOverride = "num_seats" in extras || "cash_bet" in extras;
        const legacyGame = criteria.gameType ?? criteria.game ?? "";
        const attrs: Record<string, string | number | undefined> = {
            ...extras,
            game: legacyGame,
            currency: criteria.currency,
            num_seats: numSeats,
            cash_bet: cashBet,
            players: hasLegacyOverride ? undefined : criteria.players,
            bet: hasLegacyOverride ? undefined : criteria.bet
        };
        const criteriaXml = XmlBuilder.element("criteria", attrs);

        return XmlBuilder.buildRequest("find", { pub }, [criteriaXml]);
    }
}
