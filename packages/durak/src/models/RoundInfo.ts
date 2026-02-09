export type RoundInfo = {
    attacker: number;
    defender: number;
};

export function parseRoundInfo(element: Element): RoundInfo {
    return {
        attacker: parseNumber(element.getAttribute("attacker")),
        defender: parseNumber(element.getAttribute("defender"))
    };
}

function parseNumber(value: string | null): number {
    const parsed = Number(value ?? "0");
    return Number.isNaN(parsed) ? 0 : parsed;
}
