import { WaitInfo, parseWaitInfo } from "../models/WaitInfo";

export type WaitStopEvent = {
    pub?: string;
    wait?: WaitInfo;
};

export function parseWaitStopEvent(element: Element, pub?: string): WaitStopEvent {
    const waitElement = element.querySelector("wait");
    return {
        pub,
        wait: waitElement ? parseWaitInfo(waitElement) : undefined
    };
}
