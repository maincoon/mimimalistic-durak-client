import { XmlBuilder } from "../xml/XmlBuilder";

export class GamesCommand {
    static build(): string {
        return XmlBuilder.buildRequest("games");
    }
}
