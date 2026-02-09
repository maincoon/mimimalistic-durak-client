import { describe, expect, it } from "vitest";
import { XmlParser } from "@updau/protocol";
import { Session } from "../src/session/Session";
import { TransportLike } from "../src/transport/TransportLike";

class FakeTransport implements TransportLike {
    private handlers = new Set<(payload: { data: string }) => void>();

    on(_event: "message", handler: (payload: { data: string }) => void): void {
        this.handlers.add(handler);
    }

    off(_event: "message", handler: (payload: { data: string }) => void): void {
        this.handlers.delete(handler);
    }

    send(_data: string): void {
        this.emit(
            "<response cmd=\"auth\"><token value=\"t1\"/><userinfo uid=\"1\" nickname=\"bot\" token=\"t1\"/><channel pub=\"c1\" tag=\"demo\"><state value=\"free\"/></channel></response>"
        );
    }

    private emit(data: string): void {
        this.handlers.forEach((handler) => handler({ data }));
    }
}

describe("Session", () => {
    it("parses auth response", async () => {
        const transport = new FakeTransport();
        const session = new Session(transport, new XmlParser());

        const result = await session.authenticateDemo({
            type: "demo",
            platform: "sa",
            bundle: "com.globogames.skillgames-demo",
            cookie: "abc"
        });

        expect(result.user.uid).toBe("1");
        expect(result.user.nick).toBe("bot");
        expect(result.channels[0].pub).toBe("c1");
        expect(result.token).toBe("t1");
    });
});
