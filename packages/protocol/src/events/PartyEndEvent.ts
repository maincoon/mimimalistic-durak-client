export type PartyEndEvent = {
    pub?: string;
    element: Element;
};

export function parsePartyEndEvent(element: Element, pub?: string): PartyEndEvent {
    return { pub, element };
}
