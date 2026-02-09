export type UserInfo = {
    uid: string;
    nick: string;
    token?: string;
    lvl?: number;
    exp?: number;
    created?: number;
    visited?: number;
};

export function parseUserInfo(element: Element): UserInfo {
    const nick = element.getAttribute("nick") ?? element.getAttribute("nickname") ?? "";
    return {
        uid: element.getAttribute("uid") ?? "",
        nick,
        token: readOptionalText(element.getAttribute("token")),
        lvl: parseOptionalNumber(element.getAttribute("lvl")),
        exp: parseOptionalNumber(element.getAttribute("exp")),
        created: parseOptionalNumber(element.getAttribute("created")),
        visited: parseOptionalNumber(element.getAttribute("visited"))
    };
}

function readOptionalText(value: string | null): string | undefined {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalNumber(value: string | null): number | undefined {
    if (value === null || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
