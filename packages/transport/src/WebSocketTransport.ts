import { ConnectionState } from "./ConnectionState";
import { ReconnectStrategy, ReconnectOptions } from "./ReconnectStrategy";
import {
    TransportEventHandler,
    TransportEventMap,
    TransportEventName
} from "./TransportEvents";

export type WebSocketTransportOptions = {
    autoReconnect?: boolean;
    reconnect?: ReconnectOptions;
    WebSocketCtor?: typeof WebSocket;
};

export class WebSocketTransport {
    private url: string;
    private protocols?: string | string[];
    private ws: WebSocket | null = null;
    private state: ConnectionState = ConnectionState.DISCONNECTED;
    private listeners: Map<TransportEventName, Set<TransportEventHandler<any>>> =
        new Map();
    private reconnectStrategy: ReconnectStrategy;
    private autoReconnect: boolean;
    private WebSocketCtor: typeof WebSocket;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(
        url: string,
        protocols?: string | string[],
        options: WebSocketTransportOptions = {}
    ) {
        this.url = url;
        this.protocols = protocols;
        this.autoReconnect = options.autoReconnect ?? true;
        this.reconnectStrategy = new ReconnectStrategy(options.reconnect);
        this.WebSocketCtor = options.WebSocketCtor ?? WebSocket;
    }

    get connectionState(): ConnectionState {
        return this.state;
    }

    on<K extends TransportEventName>(
        event: K,
        handler: TransportEventHandler<K>
    ): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler as TransportEventHandler<any>);
    }

    off<K extends TransportEventName>(
        event: K,
        handler: TransportEventHandler<K>
    ): void {
        this.listeners.get(event)?.delete(handler as TransportEventHandler<any>);
    }

    connect(): Promise<void> {
        if (this.state === ConnectionState.CONNECTING || this.state === ConnectionState.CONNECTED) {
            return Promise.resolve();
        }

        this.setState(ConnectionState.CONNECTING);
        const ws = new this.WebSocketCtor(this.url, this.protocols);
        this.ws = ws;

        return new Promise((resolve, reject) => {
            ws.onopen = () => {
                this.reconnectStrategy.reset();
                this.setState(ConnectionState.CONNECTED);
                this.emit("open", undefined);
                resolve();
            };

            ws.onmessage = (event) => {
                const data = typeof event.data === "string" ? event.data : String(event.data);
                this.emit("message", { data });
            };

            ws.onerror = () => {
                this.emit("error", { message: "WebSocket error" });
                reject(new Error("WebSocket error"));
            };

            ws.onclose = (event) => {
                this.ws = null;
                this.setState(ConnectionState.DISCONNECTED);
                this.emit("close", {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                if (this.autoReconnect) {
                    this.scheduleReconnect();
                }
            };
        });
    }

    disconnect(): void {
        if (!this.ws) {
            return;
        }
        this.setState(ConnectionState.DISCONNECTING);
        this.clearReconnect();
        this.ws.close();
    }

    send(data: string): void {
        if (!this.ws || this.state !== ConnectionState.CONNECTED) {
            throw new Error("WebSocket is not connected");
        }
        this.ws.send(data);
    }

    private scheduleReconnect(): void {
        this.clearReconnect();
        const delay = this.reconnectStrategy.nextDelay();
        this.reconnectTimer = setTimeout(() => {
            this.connect().catch(() => {
                this.scheduleReconnect();
            });
        }, delay);
    }

    private clearReconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private setState(state: ConnectionState): void {
        this.state = state;
        this.emit("state", state);
    }

    private emit<K extends TransportEventName>(
        event: K,
        payload: TransportEventMap[K]
    ): void {
        const handlers = this.listeners.get(event);
        if (!handlers) {
            return;
        }
        handlers.forEach((handler) => handler(payload));
    }
}
