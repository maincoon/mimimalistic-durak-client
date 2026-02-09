type Props = {
    message: string;
};

export function ErrorDisplay({ message }: Props) {
    return (
        <div className="panel error">
            <h2>Something went wrong</h2>
            <p>{message}</p>
        </div>
    );
}
