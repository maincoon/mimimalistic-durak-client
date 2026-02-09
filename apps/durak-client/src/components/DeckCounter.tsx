type Props = {
    count?: number;
};

export function DeckCounter({ count }: Props) {
    return (
        <div className="deck-counter">
            <span>Deck</span>
            <strong>{count ?? 0}</strong>
        </div>
    );
}
