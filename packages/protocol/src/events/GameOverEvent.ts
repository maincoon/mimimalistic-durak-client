export type GameOverEvent = {
    pub?: string;
    element: Element;
};

export function parseGameOverEvent(element: Element, pub?: string): GameOverEvent {
    return { pub, element };
}
