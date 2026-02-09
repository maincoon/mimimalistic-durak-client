import { XmlBuilder } from "../xml/XmlBuilder";

export class GameCommand {
    static build(pub: string, payload: string): string {
        return XmlBuilder.buildRequest("game", { pub }, [payload]);
    }
}
