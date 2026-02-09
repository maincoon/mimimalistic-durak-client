import { XmlBuilder } from "../xml/XmlBuilder";

export class ChatJoinCommand {
    static build(pub: string, roomId: string = "general"): string {
        const room = XmlBuilder.element("room", { id: roomId });
        return XmlBuilder.buildRequest("chatjoin", { pub }, [room]);
    }
}
