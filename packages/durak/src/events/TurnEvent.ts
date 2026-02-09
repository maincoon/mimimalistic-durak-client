import { TurnInfo, parseTurnInfo } from "../models/TurnInfo";

export type TurnEvent = {
    turn: TurnInfo;
};

export function parseTurnEvent(element: Element): TurnEvent {
    return {
        turn: parseTurnInfo(element)
    };
}
