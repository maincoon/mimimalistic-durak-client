import { AvailableAction } from "./models/AvailableAction";
import { Card } from "./models/Card";
import { TableState } from "./models/TableState";
import { TurnInfo } from "./models/TurnInfo";
import { TableEvent } from "./events/TableEvent";
import { CardsEvent } from "./events/CardsEvent";
import { TurnEvent } from "./events/TurnEvent";
import { AvailablesEvent } from "./events/AvailablesEvent";
import { FinishRoundEvent } from "./events/FinishRoundEvent";
import { GameStateEvent } from "./events/GameStateEvent";
import { WaitEvent } from "./events/WaitEvent";
import { TurnAction } from "./models/TurnAction";

export type DurakClientState = {
    myBox?: number;
    table?: TableState;
    hand: Card[];
    availables: AvailableAction[];
    turns: TurnInfo[];
    finishedRound: boolean;
    timer?: {
        name: string;
        box: number;
        value: number;
        timeBank: number;
    };
};

export class DurakGameClient {
    state: DurakClientState = {
        myBox: undefined,
        hand: [],
        availables: [],
        turns: [],
        finishedRound: false,
        timer: undefined
    };

    private listeners: (() => void)[] = [];

    subscribe(listener: () => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    setMyBox(box: number): void {
        this.state.myBox = box;
        this.notify();
    }

    private notify() {
        this.listeners.forEach(l => l());
    }

    handleTable(event: TableEvent): void {
        this.state.table = event.table;
        this.state.finishedRound = false;
        this.notify();
    }

    handleCards(event: CardsEvent): void {
        if (event.add) {
            this.state.hand = [...this.state.hand, ...event.cards];
        } else {
            this.state.hand = event.cards;
        }
        this.notify();
    }

    handleTurn(event: TurnEvent): void {
        const turn = this.normalizeTurn(event.turn);
        const merged = this.tryMergeTurn(turn);
        if (!merged) {
            this.state.turns = [...this.state.turns, turn];
        }

        // Update card counts
        if (this.state.table) {
            const box = this.state.table.boxes.find((b) => b.id === turn.box);
            if (box && box.cardCount > 0) {
                const playedCount = getPlayedCount(turn);
                if (playedCount > 0) {
                    box.cardCount = Math.max(0, box.cardCount - playedCount);
                }
            }
        }

        const playedCards: Card[] = [];
        if (turn.action === TurnAction.ATTACK) {
            if (turn.attackCard) {
                playedCards.push(turn.attackCard);
            } else if (turn.card) {
                playedCards.push(turn.card);
            }
        }
        if (turn.action === TurnAction.DEFEND && turn.defendCard) {
            playedCards.push(turn.defendCard);
        }

        playedCards.forEach((card) => {
            if (this.state.hand.some((item) => item.rank === card.rank && item.suit === card.suit)) {
                this.removeCardFromHand(card);
            }
        });

        this.notify();
    }

    private removeCardFromHand(cardToRemove: Card) {
        const index = this.state.hand.findIndex(
            (c) => c.rank === cardToRemove.rank && c.suit === cardToRemove.suit
        );
        if (index !== -1) {
            const newHand = [...this.state.hand];
            newHand.splice(index, 1);
            this.state.hand = newHand;
        }
    }

    handleAvailables(event: AvailablesEvent): void {
        this.state.availables = event.actions;
        this.notify();
    }

    handleFinishRound(_event: FinishRoundEvent): void {
        this.state.turns = [];
        this.state.finishedRound = true;
        this.notify();
    }

    handleGameState(event: GameStateEvent): void {
        this.state.table = event.state.table;
        this.notify();
    }

    handleWait(event: WaitEvent): void {
        const name = event.name ?? this.state.timer?.name ?? "wait";
        if (event.box !== undefined && event.value !== undefined) {
            this.state.timer = {
                name,
                box: event.box,
                value: event.value,
                timeBank: event.timeBank ?? 0
            };
        } else if (this.state.timer && event.value !== undefined) {
            this.state.timer = {
                ...this.state.timer,
                value: event.value,
                name: name,
                timeBank: event.timeBank !== undefined ? event.timeBank : this.state.timer.timeBank
            };
        }
        this.notify();
    }

    handleWaitStop(): void {
        this.state.timer = undefined;
        this.notify();
    }

    tick(): void {
        if (!this.state.timer) {
            return;
        }

        const { value, timeBank } = this.state.timer;
        let newTimer = { ...this.state.timer };
        let changed = false;

        if (value > 0) {
            newTimer.value = value - 1;
            changed = true;
        } else if (timeBank > 0) {
            newTimer.timeBank = timeBank - 1;
            changed = true;
        }

        if (changed) {
            this.state.timer = newTimer;
            this.notify();
        }
    }

    private normalizeTurn(turn: TurnInfo): TurnInfo {
        if (turn.action === TurnAction.ATTACK && turn.card && !turn.attackCard) {
            return {
                ...turn,
                attackCard: turn.card,
                card: undefined
            };
        }
        return turn;
    }

    private tryMergeTurn(turn: TurnInfo): boolean {
        if (!turn.attackCard || !turn.defendCard) {
            return false;
        }

        const index = this.state.turns.findIndex((existing) =>
            isSameCard(existing.attackCard ?? existing.card, turn.attackCard)
        );

        if (index === -1) {
            return false;
        }

        const existing = this.state.turns[index];
        const updated: TurnInfo = {
            ...existing,
            action: turn.action,
            box: turn.box,
            attackCard: existing.attackCard ?? turn.attackCard,
            defendCard: turn.defendCard,
            card: undefined
        };

        const next = [...this.state.turns];
        next[index] = updated;
        this.state.turns = next;
        return true;
    }

    resetRound(): void {
        this.state.turns = [];
        this.state.finishedRound = false;
        this.notify();
    }

    reset(): void {
        this.state = {
            myBox: undefined,
            table: undefined,
            hand: [],
            availables: [],
            turns: [],
            finishedRound: false,
            timer: undefined
        };
        this.notify();
    }
}

function isSameCard(left?: Card | null, right?: Card | null) {
    if (!left || !right) {
        return false;
    }
    return left.rank === right.rank && left.suit === right.suit;
}

function getPlayedCount(turn: TurnInfo): number {
    if (turn.action === TurnAction.ATTACK) {
        return turn.attackCard || turn.card ? 1 : 0;
    }
    if (turn.action === TurnAction.DEFEND) {
        return turn.defendCard ? 1 : 0;
    }
    return 0;
}
