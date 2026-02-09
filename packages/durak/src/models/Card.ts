import { CardRank } from "./CardRank";
import { CardSuit } from "./CardSuit";

export class Card {
    rank: CardRank;
    suit: CardSuit;

    constructor(rank: CardRank, suit: CardSuit) {
        this.rank = rank;
        this.suit = suit;
    }

    toString(): string {
        return `${this.rank}${this.suit}`
            .replace("11", "J")
            .replace("12", "Q")
            .replace("13", "K")
            .replace("14", "A");
    }

    static parse(value: string): Card {
        const suit = value.slice(-1).toLowerCase() as CardSuit;
        const rankValue = value.slice(0, -1);
        const rank = parseRank(rankValue);
        return new Card(rank, suit);
    }
}

function parseRank(value: string): CardRank {
    switch (value.toUpperCase()) {
        case "6":
            return CardRank.SIX;
        case "7":
            return CardRank.SEVEN;
        case "8":
            return CardRank.EIGHT;
        case "9":
            return CardRank.NINE;
        case "10":
        case "T":
            return CardRank.TEN;
        case "J":
            return CardRank.JACK;
        case "Q":
            return CardRank.QUEEN;
        case "K":
            return CardRank.KING;
        case "A":
            return CardRank.ACE;
        default:
            throw new Error(`Unknown rank: ${value}`);
    }
}
