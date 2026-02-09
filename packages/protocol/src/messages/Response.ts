import { MessageType } from "./MessageType";

export type Response = {
    type: MessageType.RESPONSE;
    cmd: string;
    pub?: string;
    sign?: string;
    element: Element;
};
