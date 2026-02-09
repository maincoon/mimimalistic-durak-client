type Props = {
    onRetry: () => void;
    result?: "win" | "loss" | "draw";
};

export function GameOverScreen({ onRetry, result }: Props) {
    const title = result === "win" ? "You Won!" : result === "loss" ? "You Lost!" : "Game Over";

    return (
        <div className={`panel gameover ${result || ""}`} style={{ textAlign: "center" }}>
            <h2 style={{
                color: result === "win" ? "#4caf50" : result === "loss" ? "#f04e4e" : "inherit",
                fontSize: "2.5rem",
                marginBottom: "16px"
            }}>
                {title}
            </h2>
            <p style={{ marginBottom: "24px" }}>Ready for another round?</p>
            <button
                onClick={onRetry}
                style={{
                    padding: "12px 32px",
                    fontSize: "1.2rem",
                    background: "var(--accent)",
                    color: "#0b1c15",
                    borderRadius: "8px",
                    fontWeight: "bold"
                }}
            >
                Play again
            </button>
        </div>
    );
}
