import { CardComponent } from "./CardComponent";

type Props = {
    count: number;
};

export function OpponentHand({ count }: Props) {
    return (
        <div className="hand opponent">
            {Array.from({ length: count }).map((_, index) => (
                <CardComponent key={index} faceDown />
            ))}
        </div>
    );
}
