import { BetOption, parseBetOption } from "./BetOption";
import { GameType, parseGameType } from "./GameType";
import { CriteriaOption, parseCriteriaOption } from "./CriteriaOption";

export type GameDefinition = {
    name: string;
    alias?: string;
    minPlayers?: number;
    maxPlayers?: number;
    types: GameType[];
    betOptions: BetOption[];
    criteria: CriteriaOption[];
};

export function parseGameDefinition(element: Element): GameDefinition {
    const types = Array.from(element.getElementsByTagName("type")).map((node) =>
        parseGameType(node)
    );
    const betOptions = Array.from(element.getElementsByTagName("option")).map((node) =>
        parseBetOption(node)
    );
    const criteria = Array.from(element.getElementsByTagName("var")).map((node) =>
        parseCriteriaOption(node)
    );

    return {
        name: element.getAttribute("name") ?? "",
        alias: element.getAttribute("alias") ?? undefined,
        minPlayers: parseOptionalNumber(element.getAttribute("min_players")),
        maxPlayers: parseOptionalNumber(element.getAttribute("max_players")),
        types,
        betOptions,
        criteria
    };
}

function parseOptionalNumber(value: string | null): number | undefined {
    if (value === null || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
