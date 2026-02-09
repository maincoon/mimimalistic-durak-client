import { MessageType } from "./MessageType";

export type Request = {
    type: MessageType.REQUEST;
    cmd: string;
    pub?: string;
    sign?: string;
    element: Element;
};
