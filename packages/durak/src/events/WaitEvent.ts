export type WaitEvent = {
    name?: string;
    value?: number;
    box?: number;
    timeBank?: number;
};

export function parseWaitEvent(element: Element): WaitEvent {
    return {
        name: element.getAttribute("name") ?? undefined,
        value: parseOptionalNumber(element.getAttribute("value")),
        box: parseOptionalNumber(element.getAttribute("box")),
        timeBank: parseOptionalNumber(element.getAttribute("timeBank"))
    };
}

function parseOptionalNumber(value: string | null): number | undefined {
    if (value === null || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
