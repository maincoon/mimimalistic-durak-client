export type ChannelInfo = {
    pub: string;
    tag?: string;
    state?: string;
};

export function parseChannelInfo(element: Element): ChannelInfo {
    const stateElement = element.querySelector("state");
    return {
        pub: element.getAttribute("pub") ?? "",
        tag: element.getAttribute("tag") ?? undefined,
        state: stateElement?.getAttribute("value") ?? undefined
    };
}
