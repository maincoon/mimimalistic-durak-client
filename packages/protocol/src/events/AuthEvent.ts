export type AuthEvent = {
    pub?: string;
    element: Element;
};

export function parseAuthEvent(element: Element, pub?: string): AuthEvent {
    return { pub, element };
}
