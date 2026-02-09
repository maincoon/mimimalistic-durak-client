import { AppState } from "./AppState";

export type AppModel = {
    state: AppState;
    error?: string;
    channelPub?: string;
    gameResult?: "win" | "loss" | "draw";
};

export type AppAction =
    | { type: "SET_STATE"; state: AppState }
    | { type: "SET_ERROR"; error: string }
    | { type: "SET_CHANNEL"; pub: string }
    | { type: "SET_RESULT"; result: "win" | "loss" | "draw" };

export const initialAppModel: AppModel = {
    state: AppState.CONNECTING
};

export function appReducer(model: AppModel, action: AppAction): AppModel {
    switch (action.type) {
        case "SET_STATE":
            return { ...model, state: action.state };
        case "SET_ERROR":
            return { ...model, error: action.error, state: AppState.ERROR };
        case "SET_CHANNEL":
            return { ...model, channelPub: action.pub };
        case "SET_RESULT":
            return { ...model, gameResult: action.result };
        default:
            return model;
    }
}
