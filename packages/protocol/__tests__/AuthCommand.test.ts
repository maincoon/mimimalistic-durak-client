import { describe, expect, it } from "vitest";
import { AuthCommand } from "../src/commands/AuthCommand";

describe("AuthCommand", () => {
    it("builds demo auth request", () => {
        const xml = AuthCommand.buildDemo({ cookie: "abc" });
        expect(xml).toContain("<request cmd=\"auth\" sign=\"1\">");
        expect(xml).toContain("<bundle value=\"com.globogames.skillgames-demo\"/>");
        expect(xml).toContain("<cookie value=\"abc\"/>");
    });
});
