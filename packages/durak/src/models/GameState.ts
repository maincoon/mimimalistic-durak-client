import { TableState, parseTableState } from "./TableState";

export type GameState = {
    table?: TableState;
};

export function parseGameState(element: Element): GameState {
    const tableElement = element.querySelector("table");
    return {
        table: tableElement ? parseTableState(tableElement) : undefined
    };
}
