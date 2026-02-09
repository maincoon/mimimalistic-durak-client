export type StateEvent = {
    pub?: string;
    value: string;
};

export function parseStateEvent(element: Element, pub?: string): StateEvent {
    const stateElement = element.querySelector("state");
    return {
        pub,
        value: stateElement?.getAttribute("value") ?? ""
    };
}
