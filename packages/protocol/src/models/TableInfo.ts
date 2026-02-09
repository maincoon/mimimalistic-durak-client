export type TableInfo = {
    id: string;
    created?: string;
    players?: number;
    watchers?: number;
    bet?: string;
};

export function parseTableInfo(element: Element): TableInfo {
    return {
        id: element.getAttribute("id") ?? "",
        created: element.getAttribute("created") ?? undefined,
        players: parseOptionalNumber(element.getAttribute("players")),
        watchers: parseOptionalNumber(element.getAttribute("watchers")),
        bet: element.getAttribute("bet") ?? undefined
    };
}

function parseOptionalNumber(value: string | null): number | undefined {
    if (value === null || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
