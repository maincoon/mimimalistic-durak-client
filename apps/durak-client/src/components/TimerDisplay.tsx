type Props = {
    seconds?: number;
    label?: string;
};

export function TimerDisplay({ seconds, label = "Timer" }: Props) {
    return (
        <div className="timer">
            <span>{label}</span>
            <strong>{seconds !== undefined ? seconds : "—"}</strong>
        </div>
    );
}
