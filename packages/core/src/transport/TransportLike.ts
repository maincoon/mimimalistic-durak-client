export type TransportLike = {
    send: (data: string) => void;
    on: (event: "message", handler: (payload: { data: string }) => void) => void;
    off: (event: "message", handler: (payload: { data: string }) => void) => void;
};
