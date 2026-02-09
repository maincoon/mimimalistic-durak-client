import { describe, expect, it } from "vitest";
import { MessageType } from "../src/messages/MessageType";
import { XmlParser } from "../src/xml/XmlParser";

describe("XmlParser", () => {
    it("parses a request message", () => {
        const parser = new XmlParser();
        const message = parser.parse("<request cmd=\"ping\"/>");
        expect(message.type).toBe(MessageType.REQUEST);
        expect("cmd" in message ? message.cmd : "").toBe("ping");
    });

    it("parses a pack of messages", () => {
        const parser = new XmlParser();
        const message = parser.parse(
            "<pack><action cmd=\"found\"/><response cmd=\"open\"/></pack>"
        );
        expect(message.type).toBe(MessageType.PACK);
        if (message.type === MessageType.PACK) {
            expect(message.messages).toHaveLength(2);
        }
    });
});
