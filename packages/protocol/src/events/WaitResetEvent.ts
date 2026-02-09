import { WaitInfo, parseWaitInfo } from "../models/WaitInfo";

export type WaitResetEvent = {
    pub?: string;
    wait?: WaitInfo;
};

export function parseWaitResetEvent(element: Element, pub?: string): WaitResetEvent {
    const waitElement = element.querySelector("wait");
    return {
        pub,
        wait: waitElement ? parseWaitInfo(waitElement) : undefined
    };
}
