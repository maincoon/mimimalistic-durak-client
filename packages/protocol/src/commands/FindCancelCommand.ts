import { XmlBuilder } from "../xml/XmlBuilder";

export class FindCancelCommand {
    static build(pub: string): string {
        return XmlBuilder.buildRequest("findcancel", { pub });
    }
}
