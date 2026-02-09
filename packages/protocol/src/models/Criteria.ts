export type Criteria = {
    game: string;
    currency: string;
    players: number;
    bet: string;
    gameType?: string;
    baseGame?: string;
    numSeats?: number;
    cashBet?: string;
    points?: number;
    rake?: number;
    type?: number;
    timeout?: number;
    gameMode?: number;
    timebank?: number;
};

export function parseCriteria(element: Element): Criteria {
    const gameType = element.getAttribute("game_type") ?? "";
    const baseGame = element.getAttribute("game") ?? "";
    const playersAttr = element.getAttribute("players");
    const numSeatsAttr = element.getAttribute("num_seats");
    const betAttr = element.getAttribute("bet");
    const cashBetAttr = element.getAttribute("cash_bet");
    const players = parseNumber(playersAttr ?? numSeatsAttr ?? "0");
    const numSeats = parseOptionalNumber(numSeatsAttr ?? playersAttr);
    const bet = betAttr ?? cashBetAttr ?? "";
    const cashBet = cashBetAttr ?? betAttr ?? "";

    return {
        game: gameType || baseGame,
        currency: element.getAttribute("currency") ?? "",
        players,
        bet,
        gameType: gameType || undefined,
        baseGame: baseGame || undefined,
        numSeats,
        cashBet: cashBet || undefined,
        points: parseOptionalNumber(element.getAttribute("points")),
        rake: parseOptionalNumber(element.getAttribute("rake")),
        type: parseOptionalNumber(element.getAttribute("type")),
        timeout: parseOptionalNumber(element.getAttribute("timeout")),
        gameMode: parseOptionalNumber(element.getAttribute("game_mode")),
        timebank: parseOptionalNumber(element.getAttribute("timebank"))
    };
}

function parseNumber(value: string | null): number {
    const parsed = Number(value ?? "0");
    return Number.isNaN(parsed) ? 0 : parsed;
}

function parseOptionalNumber(value: string | null | undefined): number | undefined {
    if (value === null || value === undefined || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
