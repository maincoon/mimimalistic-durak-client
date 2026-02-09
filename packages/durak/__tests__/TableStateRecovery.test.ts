
import { describe, expect, it, vi } from "vitest";
import { DurakGameClient } from "../src/DurakGameClient";
import { DurakGameController } from "../src/DurakGameController";
import { XmlParser } from "../../protocol/src/xml/XmlParser"; // Importing from source to avoid build loop issues
import { TransportLike } from "../../core/src"; // Importing from source

describe("Durak game reload fix", () => {
    it("restores board state from table cards value", () => {
        const client = new DurakGameClient();
        const transport: TransportLike = {
            send: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
            connect: vi.fn(),
            disconnect: vi.fn(),
            state: "connected"
        } as any;
        const parser = new XmlParser();
        const controller = new DurakGameController(transport, parser, client);

        // XML mimicking the HAR file
        const xml = `<response cmd="open" pub="abc">
            <state value="game">
                <gamestate>
                    <table>
                        <cards value="8s-Ks,8h-None" deck_count="12" trump="Kd" deckRelease="12">
                            <box id="0" count="5" add="3"/>
                            <box id="1" count="4" add="3"/>
                        </cards>
                    </table>
                     <info attacker="1" defender="0"/>
                </gamestate>
            </state>
        </response>`;

        // Access private method or trigger via handleMessage
        // handleMessage expects { data: string }
        (controller as any).handleMessage({ data: xml });

        // Expected:
        // Turn 1: Attack 8s (invoked by box 1)
        // Turn 2: Defend 8s with Ks (invoked by box 0) -> Merges with Turn 1
        // Turn 3: Attack 8h (invoked by box 1)
        
        const turns = client.state.turns;
        expect(turns.length).toBe(2);

        expect(turns[0].attackCard?.toString()).toBe("8s");
        expect(turns[0].defendCard?.toString()).toBe("Ks");
        expect(turns[0].action).toBe("defend");
        expect(turns[0].box).toBe(0);

        expect(turns[1].attackCard?.toString()).toBe("8h");
        expect(turns[1].defendCard).toBeUndefined();
        expect(turns[1].action).toBe("attack");
        expect(turns[1].box).toBe(1);
    });
});
