import { describe, expect, it } from "vitest";
import { XmlParser } from "@updau/protocol";
import { MatchingService } from "../src/matching/MatchingService";
import { TransportLike } from "../src/transport/TransportLike";

class FakeTransport implements TransportLike {
    private handlers = new Set<(payload: { data: string }) => void>();

    on(_event: "message", handler: (payload: { data: string }) => void): void {
        this.handlers.add(handler);
    }

    off(_event: "message", handler: (payload: { data: string }) => void): void {
        this.handlers.delete(handler);
    }

    send(data: string): void {
        if (data.includes("cmd=\"find\"")) {
            this.emit(
                "<action cmd=\"found\" pub=\"p1\"><criteria game_type=\"durak_podkidnoi\" cash_bet=\"100\" num_seats=\"2\" currency=\"DEM\" game=\"durak\"/><players><player uid=\"1\" box=\"0\"/></players></action>"
            );
        }

        if (data.includes("cmd=\"begin\"")) {
            this.emit(
                "<action cmd=\"begin\" pub=\"p1\"><gameinfo id=\"1\" tableId=\"t1\" bet=\"100\" currency=\"FUN\" gameType=\"durak\"/><self box=\"0\"/></action>"
            );
        }
    }

    private emit(data: string): void {
        this.handlers.forEach((handler) => handler({ data }));
    }
}

describe("MatchingService", () => {
    it("finds and begins", async () => {
        const transport = new FakeTransport();
        const service = new MatchingService(transport, new XmlParser());

        const found = await service.find("p1", {
            queue: "demo_durak",
            gameType: "durak_podkidnoi",
            currency: "DEM",
            numSeats: 2,
            cashBet: "100",
            points: 1
        });
        expect(found.criteria.game).toBe("durak_podkidnoi");

        const begun = await service.begin("p1");
        expect(begun.gameInfo?.tableId).toBe("t1");
    });
});
