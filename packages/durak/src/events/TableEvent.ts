import { TableState, parseTableState } from "../models/TableState";

export type TableEvent = {
    table: TableState;
};

export function parseTableEvent(element: Element): TableEvent {
    return {
        table: parseTableState(element)
    };
}
