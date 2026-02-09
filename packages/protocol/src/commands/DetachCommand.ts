import { XmlBuilder } from "../xml/XmlBuilder";

export class DetachCommand {
    static build(pub: string): string {
        return XmlBuilder.buildRequest("detach", { pub });
    }
}
