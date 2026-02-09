import { ChannelState } from "./ChannelState";

export class Channel {
    pub: string;
    tag?: string;
    state: ChannelState;

    constructor(pub: string, tag?: string, state: ChannelState = ChannelState.FREE) {
        this.pub = pub;
        this.tag = tag;
        this.state = state;
    }

    setState(state: ChannelState): void {
        this.state = state;
    }
}
