export type GameParams = {
    timeout?: number;
    numSeats?: number;
    points?: number;
    gameMode?: number;
};

export function parseGameParams(element: Element): GameParams {
    return {
        timeout: parseOptionalNumber(element.getAttribute("timeout")),
        numSeats: parseOptionalNumber(element.getAttribute("num_seats")),
        points: parseOptionalNumber(element.getAttribute("points")),
        gameMode: parseOptionalNumber(element.getAttribute("game_mode"))
    };
}

function parseOptionalNumber(value: string | null): number | undefined {
    if (value === null || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
