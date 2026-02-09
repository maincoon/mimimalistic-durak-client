import { GameState, parseGameState } from "../models/GameState";

export type GameStateEvent = {
    state: GameState;
};

export function parseGameStateEvent(element: Element): GameStateEvent {
    return {
        state: parseGameState(element)
    };
}
