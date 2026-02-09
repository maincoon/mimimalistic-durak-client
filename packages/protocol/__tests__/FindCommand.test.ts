import { describe, expect, it } from "vitest";
import { FindCommand } from "../src/commands/FindCommand";

describe("FindCommand", () => {
    it("builds queue-based find request", () => {
        const xml = FindCommand.build("pub", {
            queue: "demo_durak",
            gameType: "durak_podkidnoi",
            currency: "DEM",
            numSeats: 2,
            cashBet: "100",
            points: 1
        });

        expect(xml).toContain("<request cmd=\"find\" pub=\"pub\">");
        expect(xml).toContain("<queue name=\"demo_durak\">");
        expect(xml).toContain("<criteria game_type=\"durak_podkidnoi\"");
    });

    it("builds legacy find request", () => {
        const xml = FindCommand.build("pub", {
            game: "durak_podkidnoi",
            currency: "FUN",
            players: 2,
            bet: "100"
        });

        expect(xml).toContain("<request cmd=\"find\" pub=\"pub\">");
        expect(xml).toContain("<criteria game=\"durak_podkidnoi\"");
    });
});
