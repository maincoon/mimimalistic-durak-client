import { WaitInfo, parseWaitInfo } from "../models/WaitInfo";

export type WaitEvent = {
    pub?: string;
    wait?: WaitInfo;
};

export function parseWaitEvent(element: Element, pub?: string): WaitEvent {
    const waitElement = element.querySelector("wait");
    return {
        pub,
        wait: waitElement ? parseWaitInfo(waitElement) : undefined
    };
}
