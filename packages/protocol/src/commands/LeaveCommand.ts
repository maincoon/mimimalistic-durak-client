import { XmlBuilder } from "../xml/XmlBuilder";

export class LeaveCommand {
    static build(pub: string): string {
        return XmlBuilder.buildRequest("leave", { pub });
    }
}
