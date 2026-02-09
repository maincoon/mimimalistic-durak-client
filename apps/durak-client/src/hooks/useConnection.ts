import { useEffect, useMemo, useState } from "react";
import { ConnectionState, WebSocketTransport } from "@updau/transport";

const WS_URL = "wss://gs-ru-sg.globo.games/proto";

export function useConnection() {
    const transport = useMemo(() => new WebSocketTransport(WS_URL), []);
    const [connectionState, setConnectionState] = useState<ConnectionState>(
        ConnectionState.DISCONNECTED
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const stateHandler = (state: ConnectionState) => {
            console.info("[ws] state", state);
            setConnectionState(state);
        };
        const errorHandler = (payload: { message: string }) => {
            console.error("[ws] error", payload.message);
            setError(payload.message);
        };
        const closeHandler = (payload: { code: number; reason: string; wasClean: boolean }) => {
            if (!payload.wasClean) {
                const message = payload.reason || `WebSocket closed (${payload.code})`;
                console.warn("[ws] close", message);
                setError(message);
            }
        };

        transport.on("state", stateHandler);
        transport.on("error", errorHandler);
        transport.on("close", closeHandler);
        transport.connect().catch((err) => {
            const message = err instanceof Error ? err.message : String(err);
            console.error("[ws] connect failed", message);
            setError(message);
        });

        return () => {
            transport.off("state", stateHandler);
            transport.off("error", errorHandler);
            transport.off("close", closeHandler);
            transport.disconnect();
        };
    }, [transport]);

    return { transport, connectionState, error };
}
