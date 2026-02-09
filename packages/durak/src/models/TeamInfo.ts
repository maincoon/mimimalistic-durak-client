export type TeamInfo = {
    id: string;
    boxes: string;
};

export function parseTeamInfo(element: Element): TeamInfo {
    return {
        id: element.getAttribute("id") ?? "",
        boxes: element.getAttribute("boxes") ?? ""
    };
}
