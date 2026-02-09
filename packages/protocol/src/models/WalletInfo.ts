export type WalletInfo = {
    id?: string;
    value: string;
    currency: string;
    type?: string;
    info?: string;
    amount?: string;
};

export function parseWalletInfo(element: Element): WalletInfo {
    return {
        id: readOptionalText(element.getAttribute("id")),
        value: element.getAttribute("value") ?? "",
        currency: element.getAttribute("currency") ?? "",
        type: readOptionalText(element.getAttribute("type")),
        info: readOptionalText(element.getAttribute("info")),
        amount: readOptionalText(element.getAttribute("amount"))
    };
}

function readOptionalText(value: string | null): string | undefined {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
