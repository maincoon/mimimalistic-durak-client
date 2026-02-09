import { useEffect, useMemo, useState } from "react";
import { AvailableAction, AvailableActionType, Card, TableState, TurnInfo } from "@updau/durak";
import { PlayerHand } from "./PlayerHand";
import { OpponentHand } from "./OpponentHand";
import { PlayField } from "./PlayField";
import { ActionButtons } from "./ActionButtons";
import { TrumpIndicator } from "./TrumpIndicator";
import { DeckCounter } from "./DeckCounter";
import { TimerDisplay } from "./TimerDisplay";

type Props = {
    table?: TableState;
    timer?: { value: number; timeBank: number; box: number };
    hand: Card[];
    availables: AvailableAction[];
    turns: TurnInfo[];
    onAttack: (card: Card) => void;
    onDefend: (attack: Card, defend: Card) => void;
    onTake: () => void;
    onFinish: () => void;
};

export function GameTable({
    table,
    timer,
    hand,
    availables,
    turns,
    onAttack,
    onDefend,
    onTake,
    onFinish
}: Props) {
    const [selectedHandCard, setSelectedHandCard] = useState<Card | null>(null);
    const [selectedAttackCard, setSelectedAttackCard] = useState<Card | null>(null);
    const [takeLocked, setTakeLocked] = useState(false);
    const opponentCount = table?.boxes?.find((box) => box.id !== 0)?.cardCount ?? 0;

    const actionTypes = useMemo(() => availables.map((item) => item.type), [availables]);
    const canAttack = actionTypes.includes(AvailableActionType.ATTACK);
    const canDefend = actionTypes.includes(AvailableActionType.DEFEND);

    const attackAction = availables.find((item) => item.type === AvailableActionType.ATTACK);
    const defendAction = availables.find((item) => item.type === AvailableActionType.DEFEND);

    const attackCards = attackAction?.cards ?? [];
    const defendPairs = defendAction?.pairs ?? [];
    const defendAttackCards = useMemo(
        () => uniqueCards(defendPairs.map((pair) => pair.attack)),
        [defendPairs]
    );
    const defendCardsForAttack = (attack: Card | null) => {
        const matching = attack
            ? defendPairs.filter((pair) => isSameCard(pair.attack, attack))
            : defendPairs;
        return uniqueCards(matching.map((pair) => pair.defend));
    };
    const selectableHandCards = canDefend
        ? defendCardsForAttack(selectedAttackCard)
        : canAttack
            ? attackCards
            : [];

    const effectiveActionTypes = takeLocked
        ? actionTypes.filter((type) => type !== AvailableActionType.TAKE)
        : actionTypes;

    useEffect(() => {
        setSelectedHandCard(null);
        setSelectedAttackCard(null);
    }, [availables, turns.length]);

    useEffect(() => {
        if (!actionTypes.includes(AvailableActionType.TAKE)) {
            setTakeLocked(false);
        }
    }, [actionTypes]);

    useEffect(() => {
        if (!turns.length) {
            setTakeLocked(false);
        }
    }, [turns.length]);

    const clearSelections = () => {
        setSelectedHandCard(null);
        setSelectedAttackCard(null);
    };

    const trySendDefend = (attackCard: Card, defendCard: Card) => {
        const canPlay = defendPairs.some(
            (pair) => isSameCard(pair.attack, attackCard) && isSameCard(pair.defend, defendCard)
        );
        if (!canPlay) {
            return;
        }
        onDefend(attackCard, defendCard);
        clearSelections();
    };

    const handleHandClick = (card: Card) => {
        if (canDefend) {
            setSelectedHandCard(card);
            if (selectedAttackCard) {
                trySendDefend(selectedAttackCard, card);
            }
            return;
        }

        if (canAttack) {
            setSelectedHandCard(card);
        }
    };

    const handleHandDoubleClick = (card: Card) => {
        if (canAttack && attackCards.some((item) => isSameCard(item, card))) {
            onAttack(card);
            clearSelections();
            return;
        }

        if (canDefend) {
            const matchingPairs = defendPairs.filter((pair) => isSameCard(pair.defend, card));
            if (matchingPairs.length === 1) {
                onDefend(matchingPairs[0].attack, matchingPairs[0].defend);
                clearSelections();
            }
        }
    };

    const handleAttackCardClick = (card: Card) => {
        setSelectedAttackCard(card);
        if (selectedHandCard && canDefend) {
            trySendDefend(card, selectedHandCard);
        }
    };

    const handleTake = () => {
        if (takeLocked) {
            return;
        }
        setTakeLocked(true);
        onTake();
    };

    return (
        <div className="table">
            <div className="table-top">
                <OpponentHand count={opponentCount} />
                <div className="table-status">
                    <TrumpIndicator suit={table?.trump} />
                    {timer && (
                        <>
                            <TimerDisplay seconds={timer.value} label="Action" />
                            <TimerDisplay seconds={timer.timeBank} label="Bank" />
                        </>
                    )}
                    <DeckCounter count={table?.deckCount} />
                </div>
            </div>

            <PlayField
                turns={turns}
                onAttackCardClick={canDefend ? handleAttackCardClick : undefined}
                selectedAttackCard={selectedAttackCard}
                selectableAttackCards={canDefend ? defendAttackCards : []}
            />

            <PlayerHand
                cards={hand}
                onCardClick={canAttack || canDefend ? handleHandClick : undefined}
                onCardDoubleClick={canAttack || canDefend ? handleHandDoubleClick : undefined}
                selectedCard={selectedHandCard}
                selectableCards={selectableHandCards}
            />

            <ActionButtons
                actions={effectiveActionTypes}
                onTake={handleTake}
                onFinish={onFinish}
            />
        </div>
    );
}

function isSameCard(left: Card | null | undefined, right: Card | null | undefined) {
    if (!left || !right) {
        return false;
    }
    return left.rank === right.rank && left.suit === right.suit;
}

function uniqueCards(cards: Card[]) {
    const unique: Card[] = [];
    cards.forEach((card) => {
        if (!unique.some((item) => isSameCard(item, card))) {
            unique.push(card);
        }
    });
    return unique;
}
