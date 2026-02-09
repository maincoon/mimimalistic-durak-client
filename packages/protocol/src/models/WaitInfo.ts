export type WaitInfo = {
    name: string;
    box?: number;
    uid?: string;
    tick?: number;
    value?: number;
    timeBank?: number;
};

export function parseWaitInfo(element: Element): WaitInfo {
    return {
        name: element.getAttribute("name") ?? "",
        box: parseOptionalNumber(element.getAttribute("box")),
        uid: readOptionalText(element.getAttribute("uid")),
        tick: parseOptionalNumber(element.getAttribute("tick")),
        value: parseOptionalNumber(element.getAttribute("value")),
        timeBank: parseOptionalNumber(element.getAttribute("timeBank") || element.getAttribute("timebank"))
    };
}

function parseOptionalNumber(value: string | null): number | undefined {
    if (value === null || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

function readOptionalText(value: string | null): string | undefined {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
