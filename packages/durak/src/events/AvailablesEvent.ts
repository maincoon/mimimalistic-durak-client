import { AvailableAction, parseAvailableAction } from "../models/AvailableAction";

export type AvailablesEvent = {
    actions: AvailableAction[];
};

export function parseAvailablesEvent(element: Element): AvailablesEvent {
    const actions = Array.from(element.getElementsByTagName("available")).map((node) =>
        parseAvailableAction(node)
    );

    return { actions };
}
