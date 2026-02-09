export type SelfInfo = {
    box: number;
};

export function parseSelfInfo(element: Element): SelfInfo {
    return {
        box: parseNumber(element.getAttribute("box"))
    };
}

function parseNumber(value: string | null): number {
    const parsed = Number(value ?? "0");
    return Number.isNaN(parsed) ? 0 : parsed;
}
