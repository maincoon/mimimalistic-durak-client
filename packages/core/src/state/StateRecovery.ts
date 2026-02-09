import { ChannelInfo } from "@updau/protocol";

export type RecoveryResult = {
    mode: "PLAYING" | "WAITING_FOUND" | "WAITING_BEGIN" | "FREE";
    pub?: string;
};

export class StateRecovery {
    static fromChannels(channels: ChannelInfo[]): RecoveryResult {
        const byState = (state: string) =>
            channels.find((channel) => channel.state === state);

        const game = byState("game");
        if (game) {
            return { mode: "PLAYING", pub: game.pub };
        }

        const find = byState("find");
        if (find) {
            return { mode: "WAITING_FOUND", pub: find.pub };
        }

        const begin = byState("begin") ?? byState("okbegin");
        if (begin) {
            return { mode: "WAITING_BEGIN", pub: begin.pub };
        }

        return { mode: "FREE" };
    }
}
