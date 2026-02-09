export type FinishRoundEvent = {
    finished: boolean;
};

export function parseFinishRoundEvent(): FinishRoundEvent {
    return { finished: true };
}
