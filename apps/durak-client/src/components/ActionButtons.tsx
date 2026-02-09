import { AvailableActionType } from "@updau/durak";

type Props = {
    actions: AvailableActionType[];
    onTake: () => void;
    onFinish: () => void;
};

export function ActionButtons({ actions, onTake, onFinish }: Props) {
    const canTake = actions.includes(AvailableActionType.TAKE);
    const canFinish = actions.includes(AvailableActionType.FINISH);

    return (
        <div className="actions">
            <button onClick={onTake} disabled={!canTake}>
                Take
            </button>
            <button onClick={onFinish} disabled={!canFinish}>
                Finish
            </button>
        </div>
    );
}
