export type ReconnectOptions = {
    baseDelayMs?: number;
    maxDelayMs?: number;
    multiplier?: number;
};

export class ReconnectStrategy {
    private attempt = 0;
    private baseDelayMs: number;
    private maxDelayMs: number;
    private multiplier: number;

    constructor(options: ReconnectOptions = {}) {
        this.baseDelayMs = options.baseDelayMs ?? 1000;
        this.maxDelayMs = options.maxDelayMs ?? 30000;
        this.multiplier = options.multiplier ?? 2;
    }

    reset(): void {
        this.attempt = 0;
    }

    nextDelay(): number {
        const delay = this.baseDelayMs * Math.pow(this.multiplier, this.attempt);
        this.attempt += 1;
        return Math.min(this.maxDelayMs, delay);
    }
}
