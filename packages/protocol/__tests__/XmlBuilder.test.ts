import { describe, expect, it } from "vitest";
import { XmlBuilder } from "../src/xml/XmlBuilder";

describe("XmlBuilder", () => {
    it("builds a request with attributes", () => {
        const xml = XmlBuilder.buildRequest("ping", { sign: "test" });
        expect(xml).toBe("<request cmd=\"ping\" sign=\"test\"/>");
    });

    it("builds nested children", () => {
        const child = XmlBuilder.element("credentials", {}, [
            XmlBuilder.element("type", { value: "demo" })
        ]);
        const xml = XmlBuilder.buildRequest("auth", { sign: "auth" }, [child]);
        expect(xml).toBe(
            "<request cmd=\"auth\" sign=\"auth\"><credentials><type value=\"demo\"/></credentials></request>"
        );
    });
});
