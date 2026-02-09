import { WaitInfo, parseWaitInfo } from "../models/WaitInfo";

export type TimerStartEvent = {
    pub?: string;
    wait?: WaitInfo;
};

export function parseTimerStartEvent(element: Element, pub?: string): TimerStartEvent {
    const waitElement = element.querySelector("wait");
    return {
        pub,
        wait: waitElement ? parseWaitInfo(waitElement) : undefined
    };
}
