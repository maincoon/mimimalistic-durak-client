export type BetOption = {
    default?: string;
    view?: string;
};

export function parseBetOption(element: Element): BetOption {
    return {
        default: element.getAttribute("default") ?? undefined,
        view: element.getAttribute("view") ?? undefined
    };
}
