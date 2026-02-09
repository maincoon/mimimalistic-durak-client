export type PlayerInfo = {
    uid: string;
    box?: number;
    nick?: string;
    level?: number;
    avatar?: string;
    timeBank?: number;
    timeBankTick?: number;
};

export function parsePlayerInfo(element: Element): PlayerInfo {
    return {
        uid: element.getAttribute("uid") ?? "",
        box: parseOptionalNumber(element.getAttribute("box")),
        nick: readOptionalText(element.getAttribute("nick")),
        level: parseOptionalNumber(element.getAttribute("level")),
        avatar: readOptionalText(element.getAttribute("avatar")),
        timeBank: parseOptionalNumber(element.getAttribute("timeBank")),
        timeBankTick: parseOptionalNumber(element.getAttribute("timeBankTick"))
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
