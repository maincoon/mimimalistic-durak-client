import { WaitInfo, parseWaitInfo } from "../models/WaitInfo";

export type TimerStopEvent = {
    pub?: string;
    wait?: WaitInfo;
};

export function parseTimerStopEvent(element: Element, pub?: string): TimerStopEvent {
    const waitElement = element.querySelector("wait");
    return {
        pub,
        wait: waitElement ? parseWaitInfo(waitElement) : undefined
    };
}
