import { Card, TurnInfo } from "@updau/durak";
import { CardComponent } from "./CardComponent";

type Props = {
    turns: TurnInfo[];
    onAttackCardClick?: (card: Card) => void;
    selectedAttackCard?: Card | null;
    selectableAttackCards?: Card[];
};

export function PlayField({ turns, onAttackCardClick, selectedAttackCard, selectableAttackCards }: Props) {
    const visibleTurns = turns.filter((turn) =>
        Boolean(turn.attackCard || turn.card || turn.defendCard)
    );
    const isAttackSelectable = (card?: Card) =>
        Boolean(
            card &&
            selectableAttackCards &&
            selectableAttackCards.some((item) => item.rank === card.rank && item.suit === card.suit)
        );

    return (
        <div className="play-field">
            {visibleTurns.map((turn, index) => (
                <div key={index} className={`turn${turn.defendCard ? " paired" : ""}`}>
                    {(turn.attackCard || turn.card) && (
                        <div className="turn-attack">
                            <CardComponent
                                card={turn.attackCard ?? turn.card}
                                onClick={
                                    onAttackCardClick &&
                                        isAttackSelectable(turn.attackCard ?? turn.card)
                                        ? () => onAttackCardClick((turn.attackCard ?? turn.card)!)
                                        : undefined
                                }
                                selected={
                                    selectedAttackCard?.rank === (turn.attackCard ?? turn.card)?.rank &&
                                    selectedAttackCard?.suit === (turn.attackCard ?? turn.card)?.suit
                                }
                                disabled={
                                    Boolean(onAttackCardClick) &&
                                    !isAttackSelectable(turn.attackCard ?? turn.card)
                                }
                            />
                        </div>
                    )}
                    {turn.defendCard && (
                        <div className="turn-defend">
                            <CardComponent card={turn.defendCard} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
