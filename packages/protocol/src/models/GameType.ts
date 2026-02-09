export type GameType = {
    name: string;
    view?: string;
};

export function parseGameType(element: Element): GameType {
    return {
        name: element.getAttribute("name") ?? "",
        view: element.getAttribute("view") ?? undefined
    };
}
