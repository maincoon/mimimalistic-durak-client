import { XmlBuilder } from "../xml/XmlBuilder";

export class GetWalletCommand {
    static build(): string {
        return XmlBuilder.buildRequest("getwallet");
    }
}
