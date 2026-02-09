import { Action, MessageType, Pack, Response, XmlParser } from "@updau/protocol";
import { TransportLike } from "@updau/core";
import { DurakGameClient } from "./DurakGameClient";
import { parseTableEvent } from "./events/TableEvent";
import { parseCardsEvent } from "./events/CardsEvent";
import { parseTurnEvent } from "./events/TurnEvent";
import { parseAvailablesEvent } from "./events/AvailablesEvent";
import { parseFinishRoundEvent } from "./events/FinishRoundEvent";
import { parseGameStateEvent } from "./events/GameStateEvent";
import { parseWaitEvent } from "./events/WaitEvent";
import { TurnAction } from "./models/TurnAction";
import { Card } from "./models/Card";
import { ReadyCommand } from "./commands/ReadyCommand";
import { TurnCommand } from "./commands/TurnCommand";

export class DurakGameController {
    private transport: TransportLike;
    private parser: XmlParser;
    private client: DurakGameClient;
    private activePub?: string;

    constructor(transport: TransportLike, parser: XmlParser, client: DurakGameClient) {
        this.transport = transport;
        this.parser = parser;
        this.client = client;
    }

    attach(): void {
        this.transport.on("message", this.handleMessage);
    }

    detach(): void {
        this.transport.off("message", this.handleMessage);
    }

    sendTurn(pub: string, action: TurnAction, card?: Card, attack?: Card, defend?: Card): void {
        this.transport.send(TurnCommand.build(pub, action, card, attack, defend));
    }

    sendReady(pub: string): void {
        this.transport.send(ReadyCommand.build(pub));
    }

    setActivePub(pub?: string | null): void {
        this.activePub = pub ?? undefined;
    }

    private handleMessage = (payload: { data: string }): void => {
        const message = this.parser.parse(payload.data);
        const actions = this.unpackActions(message);

        actions.forEach((action) => {
            if (this.activePub && action.pub && action.pub !== this.activePub) {
                return;
            }
            if (action.cmd === "open") {
                this.applySnapshot(action.element);
                return;
            }

            if (action.cmd === "waitstop") {
                this.client.handleWaitStop();
                return;
            }

            if (action.cmd !== "game" && action.cmd !== "wait") {
                return;
            }

            const root = action.element;
            const table = root.querySelector("table");
            const cards = root.querySelector("cards");
            const turn = root.querySelector("turn");
            const availables = root.querySelector("availables");
            const finish = root.querySelector("finishround");
            const gamestate = root.querySelector("gamestate");

            // Prefer child <wait> element, fallback to root if attributes are present directly (legacy support or flat structure)
            const waitChild = root.querySelector("wait");
            const wait = waitChild ? waitChild : (action.cmd === "wait" ? root : undefined);

            if (table) {
                this.client.handleTable(parseTableEvent(table));
            }
            if (cards) {
                this.client.handleCards(parseCardsEvent(cards));
            }
            if (turn) {
                this.client.handleTurn(parseTurnEvent(turn));
            }
            if (availables) {
                this.client.handleAvailables(parseAvailablesEvent(availables));
            }
            if (finish) {
                this.client.handleFinishRound(parseFinishRoundEvent());
            }
            if (gamestate) {
                this.client.handleGameState(parseGameStateEvent(gamestate));
            }
            if (wait) {
                this.client.handleWait(parseWaitEvent(wait));
            }
        });
    };

    private applySnapshot(root: Element): void {
        const state = root.querySelector("state");
        const self = state?.querySelector("self");
        if (self) {
            const box = parseInt(self.getAttribute("box") ?? "-1");
            if (box !== -1) {
                this.client.setMyBox(box);
            }
        }

        const gamestate = root.querySelector("gamestate");
        if (!gamestate) {
            return;
        }

        this.client.resetRound();
        this.client.state.table = undefined;

        const info = gamestate.querySelector("info");
        const attacker = info ? parseInt(info.getAttribute("attacker") ?? "-1") : -1;
        const defender = info ? parseInt(info.getAttribute("defender") ?? "-1") : -1;

        let turnsFound = false;
        const turns = Array.from(gamestate.querySelectorAll("turn"));
        if (turns.length > 0) {
            turnsFound = true;
            turns.forEach((turn) => {
                this.client.handleTurn(parseTurnEvent(turn));
            });
        }

        const table = gamestate.querySelector("table");
        if (table) {
            this.client.handleTable(parseTableEvent(table));

            if (!turnsFound && attacker !== -1 && defender !== -1) {
                const tableCards = table.querySelector("cards");
                const value = tableCards?.getAttribute("value");
                if (value) {
                    this.restoreTurnsFromTableCards(value, attacker, defender);
                }
            }
        }

        const availables = gamestate.querySelector("availables");
        if (availables) {
            this.client.handleAvailables(parseAvailablesEvent(availables));
        }

        const cards = gamestate.querySelector("cards");
        if (cards) {
            this.client.handleCards(parseCardsEvent(cards));
        }

        const player = gamestate.querySelector("player");
        if (player) {
            const cardList = player.getAttribute("cards") ?? "";
            const parsed = this.parseCardList(cardList);
            if (parsed.length > 0) {
                this.client.handleCards({ cards: parsed, add: false });
            }
        }

        const wait = root.querySelector("wait") || gamestate.querySelector("wait");
        if (wait) {
            this.client.handleWait(parseWaitEvent(wait));
        }
    }

    private restoreTurnsFromTableCards(value: string, attacker: number, defender: number): void {
        const pairs = value.split(",");
        pairs.forEach((pair) => {
            const [attack, defend] = pair.trim().split("-");

            if (attack && attack !== "None") {
                const attackCard = Card.parse(attack);
                this.client.handleTurn({
                    turn: {
                        action: TurnAction.ATTACK,
                        box: attacker,
                        card: attackCard
                    }
                });

                if (defend && defend !== "None") {
                    this.client.handleTurn({
                        turn: {
                            action: TurnAction.DEFEND,
                            box: defender,
                            attackCard: attackCard,
                            defendCard: Card.parse(defend)
                        }
                    });
                }
            }
        });
    }

    private parseCardList(value: string): Card[] {
        if (!value) {
            return [];
        }
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => Card.parse(item));
    }

    private unpackActions(message: any): Array<Action | Response> {
        if (message.type === MessageType.PACK) {
            return (message as Pack).messages.filter(
                (item) => item.type === MessageType.ACTION || item.type === MessageType.RESPONSE
            ) as Array<Action | Response>;
        }

        if (message.type === MessageType.ACTION) {
            return [message as Action];
        }

        if (message.type === MessageType.RESPONSE) {
            return [message as Response];
        }

        return [];
    }
}
