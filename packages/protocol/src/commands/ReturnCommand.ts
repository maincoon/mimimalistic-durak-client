import { XmlBuilder } from "../xml/XmlBuilder";

export class ReturnCommand {
    static build(pub: string): string {
        return XmlBuilder.buildRequest("return", { pub });
    }
}
