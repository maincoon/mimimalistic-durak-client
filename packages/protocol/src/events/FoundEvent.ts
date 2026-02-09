import { Criteria, parseCriteria } from "../models/Criteria";
import { PlayerInfo, parsePlayerInfo } from "../models/PlayerInfo";

export type FoundEvent = {
    pub?: string;
    criteria: Criteria;
    players: PlayerInfo[];
};

export function parseFoundEvent(element: Element, pub?: string): FoundEvent {
    const criteriaElement = element.querySelector("criteria");
    const players = Array.from(element.getElementsByTagName("player")).map((node) =>
        parsePlayerInfo(node)
    );

    return {
        pub,
        criteria: criteriaElement ? parseCriteria(criteriaElement) : { game: "", currency: "", players: 0, bet: "" },
        players
    };
}
