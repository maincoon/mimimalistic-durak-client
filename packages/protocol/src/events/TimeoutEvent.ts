import { WaitInfo, parseWaitInfo } from "../models/WaitInfo";

export type TimeoutEvent = {
    pub?: string;
    wait?: WaitInfo;
};

export function parseTimeoutEvent(element: Element, pub?: string): TimeoutEvent {
    const waitElement = element.querySelector("wait");
    return {
        pub,
        wait: waitElement ? parseWaitInfo(waitElement) : undefined
    };
}
