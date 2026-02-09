import { useMemo, useState } from "react";
import { MatchingService, MatchingCriteria } from "@updau/core";
import { XmlParser } from "@updau/protocol";
import { TransportLike } from "@updau/core";

const criteria: MatchingCriteria = {
    queue: "demo_durak",
    gameType: "durak_podkidnoi",
    currency: "DEM",
    numSeats: "2",
    cashBet: "100",
    points: "1"
};

export function useMatching(transport: TransportLike, enabled: boolean, pub?: string | null) {
    const [error, setError] = useState<string | null>(null);
    const parser = useMemo(() => new XmlParser(), []);
    const service = useMemo(() => new MatchingService(transport, parser), [parser, transport]);

    const find = async () => {
        if (!enabled || !pub) {
            return null;
        }
        try {
            console.info("[match] find start", { pub, criteria });
            return await service.find(pub, criteria);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("[match] find failed", message);
            setError(message);
            return null;
        }
    };

    const begin = async () => {
        if (!enabled || !pub) {
            return null;
        }
        try {
            console.info("[match] begin start", { pub });
            return await service.begin(pub);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("[match] begin failed", message);
            setError(message);
            return null;
        }
    };

    return { find, begin, error };
}
