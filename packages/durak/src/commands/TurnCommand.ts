import { GameCommand, XmlBuilder } from "@updau/protocol";
import { TurnAction } from "../models/TurnAction";
import { Card } from "../models/Card";

export class TurnCommand {
    static build(
        pub: string,
        action: TurnAction,
        card?: Card,
        attackCard?: Card,
        defendCard?: Card
    ): string {
        const turn = XmlBuilder.element("turn", {
            action,
            card: card ? card.toString() : undefined,
            attack_card: attackCard ? attackCard.toString() : undefined,
            defend_card: defendCard ? defendCard.toString() : undefined
        });
        const game = XmlBuilder.element("game", { cmd: "turn" }, [turn]);

        return GameCommand.build(pub, game);
    }
}
