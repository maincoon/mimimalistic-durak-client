import { XmlBuilder } from "../xml/XmlBuilder";

export class OpenCommand {
    static build(pub?: string, token?: string, tag?: string, sign?: string): string {
        const children = token
            ? [XmlBuilder.element("token", { value: token, tag })]
            : [];
        return XmlBuilder.buildRequest("open", { pub, sign }, children);
    }
}
