
import { describe, expect, it, vi } from "vitest";
import { DurakGameClient } from "../src/DurakGameClient";
import { DurakGameController } from "../src/DurakGameController";
import { XmlParser } from "../../protocol/src/xml/XmlParser";

describe("Durak game setup", () => {
    it("extracts my box id from open response", () => {
        const client = new DurakGameClient();
        const transport: any = {
            on: vi.fn(),
            off: vi.fn(),
            send: vi.fn(),
        };
        const parser = new XmlParser();
        const controller = new DurakGameController(transport, parser, client);

        const xml = `<response cmd="open" pub="abc">
            <state value="game">
                <self box="1" />
                <gamestate>
                    <table />
                </gamestate>
            </state>
        </response>`;

        (controller as any).handleMessage({ data: xml });

        expect(client.state.myBox).toBe(1);
    });
});
