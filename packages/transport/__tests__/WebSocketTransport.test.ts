import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Server, WebSocket as MockWebSocket } from "mock-socket";
import { ConnectionState } from "../src/ConnectionState";
import { WebSocketTransport } from "../src/WebSocketTransport";

const WS_URL = "ws://localhost:12345";

describe("WebSocketTransport", () => {
    let server: Server;

    beforeEach(() => {
        server = new Server(WS_URL);
    });

    afterEach(() => {
        server.close();
    });

    it("connects and emits messages", async () => {
        const transport = new WebSocketTransport(WS_URL, undefined, {
            WebSocketCtor: MockWebSocket
        });

        const messages: string[] = [];
        transport.on("message", (payload) => messages.push(payload.data));

        server.on("connection", (socket) => {
            socket.send("hello");
        });

        await transport.connect();
        expect(transport.connectionState).toBe(ConnectionState.CONNECTED);

        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(messages).toEqual(["hello"]);
    });

    it("sends messages to server", async () => {
        const transport = new WebSocketTransport(WS_URL, undefined, {
            WebSocketCtor: MockWebSocket
        });

        const messagePromise = new Promise<string>((resolve) => {
            server.on("connection", (socket) => {
                socket.on("message", (data) => {
                    resolve(String(data));
                });
            });
        });

        await transport.connect();
        transport.send("ping");

        await expect(messagePromise).resolves.toBe("ping");
    });

    it("auto-reconnects after close", async () => {
        const transport = new WebSocketTransport(WS_URL, undefined, {
            WebSocketCtor: MockWebSocket,
            reconnect: { baseDelayMs: 10, maxDelayMs: 10 }
        });

        const opened = vi.fn();
        transport.on("open", opened);

        await transport.connect();
        server.close({ code: 1001, reason: "reconnect", wasClean: true });

        await new Promise((resolve) => setTimeout(resolve, 30));
        expect(opened).toHaveBeenCalled();
    });
});
