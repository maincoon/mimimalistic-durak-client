import { Card, CardSuit } from "@updau/durak";
import { useMemo } from "react";
import { CardComponent } from "./CardComponent";

type Props = {
    cards: Card[];
    onCardClick?: (card: Card) => void;
    onCardDoubleClick?: (card: Card) => void;
    selectedCard?: Card | null;
    selectableCards?: Card[];
};

export function PlayerHand({ cards, onCardClick, onCardDoubleClick, selectedCard, selectableCards }: Props) {
    const isSelectable = (card: Card) =>
        !selectableCards || selectableCards.some((item) => item.rank === card.rank && item.suit === card.suit);

    const sortedCards = useMemo(() => {
        const order: Record<CardSuit, number> = {
            [CardSuit.CLUBS]: 0,
            [CardSuit.DIAMONDS]: 1,
            [CardSuit.HEARTS]: 2,
            [CardSuit.SPADES]: 3
        };

        return [...cards].sort((a, b) => {
            const suitDelta = order[a.suit] - order[b.suit];
            if (suitDelta !== 0) {
                return suitDelta;
            }
            return a.rank - b.rank;
        });
    }, [cards]);

    return (
        <div className="hand player">
            {sortedCards.map((card, index) => (
                <CardComponent
                    key={`${card.toString()}-${index}`}
                    card={card}
                    onClick={onCardClick && isSelectable(card) ? () => onCardClick(card) : undefined}
                    onDoubleClick={
                        onCardDoubleClick && isSelectable(card) ? () => onCardDoubleClick(card) : undefined
                    }
                    selected={
                        selectedCard?.rank === card.rank && selectedCard?.suit === card.suit
                    }
                    disabled={!isSelectable(card)}
                />
            ))}
        </div>
    );
}
