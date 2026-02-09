import { Action } from "./Action";
import { MessageType } from "./MessageType";
import { Request } from "./Request";
import { Response } from "./Response";

export type Pack = {
    type: MessageType.PACK;
    messages: Array<Request | Response | Action>;
};
