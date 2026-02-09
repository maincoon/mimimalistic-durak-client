export type MatchingCriteria = {
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
