import { FindCommand, GamesCommand, MessageType, XmlParser } from "@updau/protocol";
import { WebSocketTransport } from "@updau/transport";

export type MatchingCriteriaPayload = {
    game: string;
    gameType: string;
    queue: string;
    currency: string;
    players: string;
    bet: string;
    numSeats: string;
    cashBet: string;
    points: string;
    extras: Record<string, string>;
};

type FindCriteria = {
    queue?: string;
    game?: string;
    gameType?: string;
    currency?: string;
    players?: string;
    bet?: string;
    numSeats?: string;
    cashBet?: string;
    points?: string;
    extras?: Record<string, string>;
};

export async function attemptFind(
    transportA: WebSocketTransport,
    transportB: WebSocketTransport,
    parser: XmlParser,
    pubA: string,
    pubB: string,
    criteria: MatchingCriteriaPayload
): Promise<void> {
    const candidates: FindCriteria[] = [];

    if (criteria.queue) {
        candidates.push({
            queue: criteria.queue,
            gameType: criteria.gameType,
            currency: criteria.currency,
            numSeats: criteria.numSeats,
            cashBet: criteria.cashBet,
            points: criteria.points,
            extras: criteria.extras
        });
    }

    const legacyGame = criteria.gameType || criteria.game;
    candidates.push(
        {
            game: legacyGame,
            currency: criteria.currency,
            players: criteria.players,
            bet: criteria.bet
        },
        {
            game: legacyGame,
            currency: criteria.currency,
            numSeats: criteria.numSeats,
            cashBet: criteria.cashBet,
            extras: criteria.extras
        },
        {
            game: criteria.extras.game_type ?? legacyGame,
            currency: criteria.currency,
            players: "2,3,4",
            bet: "100,300"
        }
    );

    let lastError: Error | null = null;
    for (const attrs of candidates) {
        console.info("[real] trying find criteria", attrs);
        try {
            await Promise.all([
                sendFind(transportA, parser, pubA, attrs, "A"),
                sendFind(transportB, parser, pubB, attrs, "B")
            ]);
            await Promise.all([
                waitForAction(transportA, parser, "found"),
                waitForAction(transportB, parser, "found")
            ]);
            return;
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
        }
    }

    throw lastError ?? new Error("All find request variants failed");
}

export function sendFind(
    transport: WebSocketTransport,
    parser: XmlParser,
    pub: string,
    criteria: FindCriteria,
    label: string,
    timeoutMs: number = 5000
): Promise<void> {
    const requestXml = FindCommand.build(pub, criteria);
    console.info(`[real][${label}] find request`, requestXml);
    const wait = waitForResponse(transport, parser, "find", timeoutMs);
    transport.send(requestXml);
    return wait;
}

export function waitForResponse(
    transport: WebSocketTransport,
    parser: XmlParser,
    cmd: string,
    timeoutMs: number
): Promise<void> {
    return new Promise((resolve, reject) => {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const cleanup = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            transport.off("message", handler);
        };

        const handler = (payload: { data: string }) => {
            try {
                const message = parser.parse(payload.data);
                if (message.type !== MessageType.RESPONSE || message.cmd !== cmd) {
                    return;
                }
                const errorElement = message.element.querySelector("error");
                if (errorElement) {
                    const details = (errorElement.textContent ?? "").trim() || `${cmd} failed`;
                    cleanup();
                    reject(new Error(`${cmd} failed: ${details}. Response: ${message.element.outerHTML}`));
                    return;
                }
                cleanup();
                resolve();
            } catch (err) {
                cleanup();
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        };

        timeout = setTimeout(() => {
            cleanup();
            reject(new Error(`${cmd} response timed out`));
        }, timeoutMs);

        transport.on("message", handler);
    });
}

export function waitForResponseElement(
    transport: WebSocketTransport,
    parser: XmlParser,
    cmd: string,
    timeoutMs: number
): Promise<Element> {
    return new Promise((resolve, reject) => {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const cleanup = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            transport.off("message", handler);
        };

        const handler = (payload: { data: string }) => {
            try {
                const message = parser.parse(payload.data);
                if (message.type !== MessageType.RESPONSE || message.cmd !== cmd) {
                    return;
                }
                const errorElement = message.element.querySelector("error");
                if (errorElement) {
                    const details = (errorElement.textContent ?? "").trim() || `${cmd} failed`;
                    cleanup();
                    reject(new Error(`${cmd} failed: ${details}. Response: ${message.element.outerHTML}`));
                    return;
                }
                cleanup();
                resolve(message.element);
            } catch (err) {
                cleanup();
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        };

        timeout = setTimeout(() => {
            cleanup();
            reject(new Error(`${cmd} response timed out`));
        }, timeoutMs);

        transport.on("message", handler);
    });
}

export function waitForAction(
    transport: WebSocketTransport,
    parser: XmlParser,
    cmd: string,
    timeoutMs: number = 15000
): Promise<void> {
    return new Promise((resolve, reject) => {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const cleanup = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            transport.off("message", handler);
        };

        const handler = (payload: { data: string }) => {
            try {
                const message = parser.parse(payload.data);
                if (message.type !== MessageType.ACTION || message.cmd !== cmd) {
                    return;
                }
                cleanup();
                resolve();
            } catch (err) {
                cleanup();
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        };

        timeout = setTimeout(() => {
            cleanup();
            reject(new Error(`${cmd} action timed out`));
        }, timeoutMs);

        transport.on("message", handler);
    });
}

export function hookLogging(
    transport: WebSocketTransport,
    parser: XmlParser,
    label: string,
    sent: string[]
): void {
    const originalSend = transport.send.bind(transport);
    transport.send = (data: string) => {
        sent.push(data);
        logIfFindRequest(data, parser, label);
        console.info(`[real][${label}] send`, data);
        originalSend(data);
    };
}

export function fetchMatchingCriteria(
    transport: WebSocketTransport,
    parser: XmlParser,
    preferredCurrency?: string,
    timeoutMs: number = 8000
): Promise<MatchingCriteriaPayload> {
    return new Promise((resolve, reject) => {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const cleanup = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            transport.off("message", handler);
        };

        const handler = (payload: { data: string }) => {
            try {
                const message = parser.parse(payload.data);
                if (message.type !== MessageType.RESPONSE || message.cmd !== "games") {
                    return;
                }
                console.info("[real] games response", message.element.outerHTML);
                const games = Array.from(message.element.getElementsByTagName("game"));
                if (games.length === 0) {
                    cleanup();
                    reject(new Error("Games response did not include any game elements"));
                    return;
                }

                const pick = selectPreferredGame(games);

                if (!pick || pick.minPlayers < 2 || !pick.typeElement) {
                    cleanup();
                    reject(new Error("No multiplayer games available for matching"));
                    return;
                }

                const gameElement = pick.element;
                const typeElement = pick.typeElement;
                const baseGameName = gameElement.getAttribute("name") ?? "";
                const typeName = typeElement.getAttribute("name") ?? "";
                const gameName = baseGameName || typeName;
                if (!gameName) {
                    cleanup();
                    reject(new Error("Game name is missing in games response"));
                    return;
                }

                const criteriaRoot = typeElement?.querySelector("criterias") ?? gameElement;
                const extras = extractDefaultCriteria(criteriaRoot);
                const forcedCurrency = pickPreferredCriteriaValue(criteriaRoot, "currency", preferredCurrency);
                if (forcedCurrency) {
                    extras.currency = forcedCurrency;
                }
                if (baseGameName && typeName && baseGameName !== typeName) {
                    extras.game_type = typeName;
                }
                const { currency, bet, cashBet } = parseBet(criteriaRoot, extras);
                const players = String(extras.num_seats ?? pick.minPlayers ?? 2);
                const numSeats = String(extras.num_seats ?? players);
                const gameType = (extras.game_type ?? typeName) || gameName;
                const queue = buildQueueName(baseGameName || gameName, currency);
                const points = extras.points ?? "";

                const criteria = {
                    game: gameName,
                    gameType,
                    queue,
                    currency,
                    players,
                    bet,
                    numSeats,
                    cashBet,
                    points,
                    extras
                };
                console.info("[real] matching criteria", criteria);
                cleanup();
                resolve(criteria);
            } catch (err) {
                cleanup();
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        };

        timeout = setTimeout(() => {
            cleanup();
            reject(new Error("Games request timed out"));
        }, timeoutMs);

        transport.on("message", handler);
        transport.send(GamesCommand.build());
    });
}

export function randomCookie(): string {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }
    return `demo-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function logIfFindRequest(data: string, parser: XmlParser, label: string): void {
    try {
        const message = parser.parse(data);
        if (message.type !== MessageType.REQUEST || message.cmd !== "find") {
            return;
        }
        const queueElement = message.element.querySelector("queue");
        const criteriaElement = message.element.querySelector("criteria");
        if (!criteriaElement) {
            console.warn(`[real][${label}] find request missing <criteria>`, data);
            return;
        }
        const attrs = {
            game: criteriaElement.getAttribute("game") ?? "",
            gameType: criteriaElement.getAttribute("game_type") ?? "",
            currency: criteriaElement.getAttribute("currency") ?? "",
            players: criteriaElement.getAttribute("players") ?? "",
            bet: criteriaElement.getAttribute("bet") ?? "",
            numSeats: criteriaElement.getAttribute("num_seats") ?? "",
            cashBet: criteriaElement.getAttribute("cash_bet") ?? ""
        };
        const queue = queueElement?.getAttribute("name") ?? "";
        console.info(`[real][${label}] find request attrs`, { queue, ...attrs });
    } catch (err) {
        console.warn(`[real][${label}] failed to parse request`, err);
    }
}

function parsePlayers(gameElement: Element): number {
    const minPlayers = Number(gameElement.getAttribute("min_players") ?? "0");
    if (Number.isFinite(minPlayers) && minPlayers > 0) {
        return minPlayers;
    }
    const optionText = gameElement.querySelector("var option")?.textContent ?? "";
    const parsed = Number(optionText.trim());
    return Number.isNaN(parsed) ? 0 : parsed;
}

function parseBet(
    _criteriaRoot: Element,
    extras: Record<string, string>
): { currency: string; bet: string; cashBet: string } {
    const currency = extras.currency || "FUN";
    const cashBet = extras.cash_bet || "100";
    const bet = extras.bet || cashBet || "100";
    return { currency, bet, cashBet };
}

function extractDefaultCriteria(root: Element): Record<string, string> {
    const result: Record<string, string> = {};
    const vars = Array.from(root.getElementsByTagName("var"));
    vars.forEach((item) => {
        const name = item.getAttribute("name");
        if (!name) {
            return;
        }
        const options = Array.from(item.getElementsByTagName("option"));
        if (options.length === 0) {
            return;
        }
        const preferred = options.find((option) => option.getAttribute("default") === "true") ?? options[0];
        const value = (preferred.textContent ?? "").trim();
        if (value) {
            result[name] = value;
        }
    });
    return result;
}

function pickPreferredCriteriaValue(
    root: Element,
    name: string,
    preferred?: string
): string | undefined {
    if (!preferred) {
        return undefined;
    }
    const target = preferred.trim().toLowerCase();
    if (!target) {
        return undefined;
    }
    const varNode = Array.from(root.getElementsByTagName("var")).find(
        (item) => (item.getAttribute("name") ?? "").toLowerCase() === name.toLowerCase()
    );
    if (!varNode) {
        return undefined;
    }
    const options = Array.from(varNode.getElementsByTagName("option"));
    const match = options.find((option) => (option.textContent ?? "").trim().toLowerCase() === target);
    return match ? (match.textContent ?? "").trim() : undefined;
}

function buildQueueName(game: string, currency: string): string {
    if (!game) {
        return "";
    }
    const upper = currency.toUpperCase();
    if (!upper || upper === "FUN") {
        return game;
    }
    if (upper === "DEM") {
        return `demo_${game}`;
    }
    return `${upper.toLowerCase()}_${game}`;
}

function selectPreferredGame(
    games: Element[]
): { element: Element; typeElement: Element | null; minPlayers: number } | null {
    const durak = games.find((game) => game.getAttribute("name") === "durak");
    if (durak) {
        const typeElement =
            durak.querySelector("type[name=\"durak_podkidnoi\"]") ?? durak.querySelector("type");
        return {
            element: durak,
            typeElement,
            minPlayers: parsePlayers(durak)
        };
    }

    const sorted = games
        .map((game) => ({
            element: game,
            typeElement: game.querySelector("type"),
            minPlayers: parsePlayers(game)
        }))
        .sort((a, b) => b.minPlayers - a.minPlayers);
    return sorted.find((item) => item.minPlayers >= 2) ?? sorted[0] ?? null;
}
