import { XmlBuilder } from "../xml/XmlBuilder";

export class BeginCommand {
    static build(pub: string): string {
        return XmlBuilder.buildRequest("begin", { pub });
    }
}
