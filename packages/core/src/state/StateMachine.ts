import { ChannelState } from "../channel/ChannelState";

export type ChannelTransition = {
    from: ChannelState;
    to: ChannelState;
    event: string;
};

export class StateMachine {
    private transitions: ChannelTransition[];

    constructor(transitions: ChannelTransition[]) {
        this.transitions = transitions;
    }

    canTransition(from: ChannelState, to: ChannelState): boolean {
        return this.transitions.some(
            (transition) => transition.from === from && transition.to === to
        );
    }

    transition(from: ChannelState, to: ChannelState): ChannelState {
        if (!this.canTransition(from, to)) {
            throw new Error(`Invalid transition: ${from} -> ${to}`);
        }
        return to;
    }
}

export const defaultChannelTransitions: ChannelTransition[] = [
    { from: ChannelState.FREE, to: ChannelState.FIND, event: "E2" },
    { from: ChannelState.FIND, to: ChannelState.FREE, event: "E12" },
    { from: ChannelState.FIND, to: ChannelState.BEGIN, event: "E3" },
    { from: ChannelState.BEGIN, to: ChannelState.OKBEGIN, event: "E4" },
    { from: ChannelState.OKBEGIN, to: ChannelState.GAME, event: "E6" },
    { from: ChannelState.GAME, to: ChannelState.FREE, event: "E23" },
    { from: ChannelState.GAME, to: ChannelState.LEAVE, event: "E24" },
    { from: ChannelState.LEAVE, to: ChannelState.GAME, event: "E25" },
    { from: ChannelState.LEAVE, to: ChannelState.FREE, event: "E26" },
    { from: ChannelState.GAME, to: ChannelState.REVANCHE, event: "E7" },
    { from: ChannelState.REVANCHE, to: ChannelState.FREE, event: "E11" },
    { from: ChannelState.REVANCHE, to: ChannelState.OKREVANCHE, event: "E8" },
    { from: ChannelState.OKREVANCHE, to: ChannelState.GAME, event: "E9" },
    { from: ChannelState.OKREVANCHE, to: ChannelState.FREE, event: "E10" },
    { from: ChannelState.FREE, to: ChannelState.GAME, event: "E27" }
];
