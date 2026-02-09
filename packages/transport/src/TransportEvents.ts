import { ConnectionState } from "./ConnectionState";

export type TransportEventMap = {
    open: undefined;
    close: { code: number; reason: string; wasClean: boolean };
    error: { message: string };
    message: { data: string };
    state: ConnectionState;
};

export type TransportEventName = keyof TransportEventMap;

export type TransportEventHandler<K extends TransportEventName> = (
    payload: TransportEventMap[K]
) => void;
