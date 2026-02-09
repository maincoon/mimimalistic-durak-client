type Props = {
    title: string;
    subtitle?: string;
};

export function MatchingScreen({ title, subtitle }: Props) {
    return (
        <div className="panel matching">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
            <div className="pulse" />
        </div>
    );
}
