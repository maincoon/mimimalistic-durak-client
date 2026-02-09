import { Card } from "@updau/durak";

type Props = {
    card?: Card;
    faceDown?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
    selected?: boolean;
    disabled?: boolean;
};

export function CardComponent({ card, faceDown, onClick, onDoubleClick, selected, disabled }: Props) {
    const classes = ["card", faceDown ? "back" : "face"];
    if (selected) classes.push("selected");
    if (disabled) classes.push("disabled");

    if (faceDown) {
        return (
            <button
                className={classes.join(" ")}
                onClick={disabled ? undefined : onClick}
                onDoubleClick={disabled ? undefined : onDoubleClick}
                disabled={disabled}
            >
                <img src="/cards/back.svg" alt="Back" />
            </button>
        );
    }

    if (!card) return null;

    const code = card.toString();

    return (
        <button
            className={classes.join(" ")}
            onClick={disabled ? undefined : onClick}
            onDoubleClick={disabled ? undefined : onDoubleClick}
            disabled={disabled}
        >
            <img src={`/cards/${code}.svg`} alt={code} />
        </button>
    );
}
