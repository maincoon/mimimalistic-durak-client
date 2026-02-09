import { MessageType } from "./MessageType";

export type Action = {
    type: MessageType.ACTION;
    cmd: string;
    pub?: string;
    element: Element;
};
