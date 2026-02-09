export type ProtocolError = {
    code: string;
    message?: string;
};

export function parseProtocolError(element: Element): ProtocolError {
    return {
        code: element.getAttribute("code") ?? "",
        message: element.textContent ?? undefined
    };
}
