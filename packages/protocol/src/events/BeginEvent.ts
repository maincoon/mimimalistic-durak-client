import { GameInfo, parseGameInfo } from "../models/GameInfo";
import { PlayerInfo, parsePlayerInfo } from "../models/PlayerInfo";
import { SelfInfo, parseSelfInfo } from "../models/SelfInfo";

export type BeginEvent = {
    pub?: string;
    gameInfo?: GameInfo;
    self?: SelfInfo;
    players: PlayerInfo[];
};

export function parseBeginEvent(element: Element, pub?: string): BeginEvent {
    const gameInfoElement = element.querySelector("gameinfo");
    const selfElement = element.querySelector("self");
    const players = Array.from(element.getElementsByTagName("player")).map((node) =>
        parsePlayerInfo(node)
    );

    return {
        pub,
        gameInfo: gameInfoElement ? parseGameInfo(gameInfoElement) : undefined,
        self: selfElement ? parseSelfInfo(selfElement) : undefined,
        players
    };
}
