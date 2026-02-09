import { XmlBuilder } from "../xml/XmlBuilder";

export class ChatLeaveCommand {
    static build(pub: string): string {
        return XmlBuilder.buildRequest("chatleave", { pub });
    }
}
