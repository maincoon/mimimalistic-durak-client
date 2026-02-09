import { GameCommand, XmlBuilder } from "@updau/protocol";

export class ReadyCommand {
    static build(pub: string): string {
        const game = XmlBuilder.element("game", { cmd: "ready" });
        return GameCommand.build(pub, game);
    }
}
