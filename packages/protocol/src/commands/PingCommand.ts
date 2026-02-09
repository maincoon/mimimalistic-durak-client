import { XmlBuilder } from "../xml/XmlBuilder";

export class PingCommand {
    static build(): string {
        return XmlBuilder.buildRequest("ping");
    }
}
