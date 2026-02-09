export type RoomInfo = {
    id: string;
};

export function parseRoomInfo(element: Element): RoomInfo {
    return {
        id: element.getAttribute("id") ?? ""
    };
}
