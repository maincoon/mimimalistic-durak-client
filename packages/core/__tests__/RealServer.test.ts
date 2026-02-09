// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { XmlParser } from "@updau/protocol";
import { WebSocketTransport } from "@updau/transport";
import { ChannelManager } from "../src/channel/ChannelManager";
import { MatchingService } from "../src/matching/MatchingService";
import { Session } from "../src/session/Session";
import {
    attemptFind,
    fetchMatchingCriteria,
    hookLogging,
    randomCookie,
    waitForResponseElement
} from "./realServerTestUtils";

declare const process: { env: Record<string, string | undefined> };
const WS_URL = process.env.REAL_SERVER_URL ?? "wss://gs-ru-sg.globo.games/proto";

describe("Real server client flow", () => {
    const WebSocketCtor = globalThis.WebSocket;
    const parser = new XmlParser();
    let transportA: WebSocketTransport;
    let transportB: WebSocketTransport;

    beforeAll(async () => {
        if (!globalThis.DOMParser) {
            globalThis.DOMParser = new JSDOM().window.DOMParser;
        }
        if (!WebSocketCtor) {
            throw new Error("WebSocket is not available in this environment");
        }
        transportA = new WebSocketTransport(WS_URL, undefined, { WebSocketCtor });
        transportB = new WebSocketTransport(WS_URL, undefined, { WebSocketCtor });
        await Promise.all([transportA.connect(), transportB.connect()]);
    }, 20000);

    afterAll(() => {
        transportA.disconnect();
        transportB.disconnect();
    });

    it("authenticates, opens channels, and matches two clients", async () => {
        const sessionA = new Session(transportA, parser);
        const sessionB = new Session(transportB, parser);
        const managerA = new ChannelManager(transportA, parser);
        const managerB = new ChannelManager(transportB, parser);
        const matchingA = new MatchingService(transportA, parser);
        const matchingB = new MatchingService(transportB, parser);

        const sentA: string[] = [];
        const sentB: string[] = [];
        hookLogging(transportA, parser, "A", sentA);
        hookLogging(transportB, parser, "B", sentB);

        const cookieA = randomCookie();
        const cookieB = randomCookie();

        const [sessionInfoA, sessionInfoB] = await Promise.all([
            sessionA.authenticateDemo({
                type: "demo",
                platform: "sa",
                bundle: "com.globogames.skillgames-demo",
                cookie: cookieA
            }),
            sessionB.authenticateDemo({
                type: "demo",
                platform: "sa",
                bundle: "com.globogames.skillgames-demo",
                cookie: cookieB
            })
        ]);

        expect(sessionInfoA.user.uid).not.toBe("");
        expect(sessionInfoB.user.uid).not.toBe("");

        console.info("[real] auth channels A", sessionInfoA.channels);
        console.info("[real] auth channels B", sessionInfoB.channels);

        const preferredPubA = sessionInfoA.channels[0]?.pub;
        const preferredPubB = sessionInfoB.channels[0]?.pub;

        const [channelInfoA, channelInfoB] = await Promise.all([
            managerA.open(preferredPubA, sessionInfoA.token),
            managerB.open(preferredPubB, sessionInfoB.token)
        ]);

        expect(channelInfoA.pub).not.toBe("");
        expect(channelInfoB.pub).not.toBe("");

        const criteria = await fetchMatchingCriteria(transportA, parser, "DEM");

        await attemptFind(transportA, transportB, parser, channelInfoA.pub, channelInfoB.pub, criteria);

        await Promise.all([
            matchingA.begin(channelInfoA.pub),
            matchingB.begin(channelInfoB.pub)
        ]);
    }, 40000);
});

describe("Real server reconnection flow", () => {
    const WebSocketCtor = globalThis.WebSocket;
    const parser = new XmlParser();
    let transportA: WebSocketTransport;
    let transportB: WebSocketTransport;

    beforeAll(async () => {
        if (!globalThis.DOMParser) {
            globalThis.DOMParser = new JSDOM().window.DOMParser;
        }
        if (!WebSocketCtor) {
            throw new Error("WebSocket is not available in this environment");
        }
        transportA = new WebSocketTransport(WS_URL, undefined, { WebSocketCtor });
        transportB = new WebSocketTransport(WS_URL, undefined, { WebSocketCtor });
        await Promise.all([transportA.connect(), transportB.connect()]);
    }, 20000);

    afterAll(() => {
        transportA.disconnect();
        transportB.disconnect();
    });

    it("reconnects and restores open snapshot", async () => {
        const sessionA = new Session(transportA, parser);
        const sessionB = new Session(transportB, parser);
        const managerA = new ChannelManager(transportA, parser);
        const managerB = new ChannelManager(transportB, parser);
        const matchingA = new MatchingService(transportA, parser);
        const matchingB = new MatchingService(transportB, parser);

        const cookieA = randomCookie();
        const cookieB = randomCookie();

        const [sessionInfoA, sessionInfoB] = await Promise.all([
            sessionA.authenticateDemo({
                type: "demo",
                platform: "sa",
                bundle: "com.globogames.skillgames-demo",
                cookie: cookieA
            }),
            sessionB.authenticateDemo({
                type: "demo",
                platform: "sa",
                bundle: "com.globogames.skillgames-demo",
                cookie: cookieB
            })
        ]);

        const preferredPubA = sessionInfoA.channels[0]?.pub;
        const preferredPubB = sessionInfoB.channels[0]?.pub;

        const [channelInfoA, channelInfoB] = await Promise.all([
            managerA.open(preferredPubA, sessionInfoA.token),
            managerB.open(preferredPubB, sessionInfoB.token)
        ]);

        const criteria = await fetchMatchingCriteria(transportA, parser, "DEM");

        await attemptFind(transportA, transportB, parser, channelInfoA.pub, channelInfoB.pub, criteria);

        await Promise.all([
            matchingA.begin(channelInfoA.pub),
            matchingB.begin(channelInfoB.pub)
        ]);

        transportA.disconnect();
        const reconnectTransport = new WebSocketTransport(WS_URL, undefined, { WebSocketCtor });
        await reconnectTransport.connect();

        const sessionAfterReconnect = new Session(reconnectTransport, parser);
        const sessionInfoAfterReconnect = await sessionAfterReconnect.authenticateDemo({
            type: "demo",
            platform: "sa",
            bundle: "com.globogames.skillgames-demo",
            cookie: cookieA
        });

        const reconnectManager = new ChannelManager(reconnectTransport, parser);
        const openResponse = waitForResponseElement(reconnectTransport, parser, "open", 8000);
        await reconnectManager.open(channelInfoA.pub, sessionInfoAfterReconnect.token);
        const openElement = await openResponse;

        const stateValue = openElement.querySelector("state")?.getAttribute("value");
        expect(stateValue).toBeTruthy();

        if (stateValue === "game") {
            const gamestate = openElement.querySelector("gamestate");
            expect(gamestate).not.toBeNull();
            const table = gamestate?.querySelector("table");
            const cards = gamestate?.querySelector("cards");
            expect(table).not.toBeNull();
            expect(cards).not.toBeNull();
            const deckCount = cards?.getAttribute("deck_count") ?? table?.getAttribute("deck_count");
            const trump = cards?.getAttribute("trump") ?? table?.getAttribute("trump");
            expect(deckCount).toBeTruthy();
            expect(trump).toBeTruthy();
        }
        reconnectTransport.disconnect();
    }, 60000);
});
