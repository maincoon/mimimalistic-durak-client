export type GameInfo = {
    id: string;
    name?: string;
    tableId: string;
    bet: string;
    points?: string;
    currency?: string;
    gameType: string;
};

export function parseGameInfo(element: Element): GameInfo {
    return {
        id: element.getAttribute("id") ?? "",
        name: element.getAttribute("name") ?? undefined,
        tableId: element.getAttribute("tableId") ?? "",
        bet: element.getAttribute("bet") ?? "",
        points: element.getAttribute("points") ?? undefined,
        currency: element.getAttribute("currency") ?? undefined,
        gameType: element.getAttribute("gameType") ?? ""
    };
}
