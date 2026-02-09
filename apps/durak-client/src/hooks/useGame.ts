import { useEffect, useMemo, useState } from "react";
import { XmlParser } from "@updau/protocol";
import { TransportLike } from "@updau/core";
import { DurakGameClient, DurakGameController } from "@updau/durak";

export function useGame(transport: TransportLike, enabled: boolean, activePub?: string | null) {
    const [client] = useState(() => new DurakGameClient());
    const [, setTick] = useState(0);

    const parser = useMemo(() => new XmlParser(), []);
    const controller = useMemo(
        () => new DurakGameController(transport, parser, client),
        [client, parser, transport]
    );

    useEffect(() => {
        return client.subscribe(() => {
            setTick((t) => t + 1);
        });
    }, [client]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const interval = setInterval(() => {
            client.tick();
        }, 1000);

        return () => clearInterval(interval);
    }, [client, enabled]);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        controller.attach();
        return () => controller.detach();
    }, [controller, enabled]);

    useEffect(() => {
        if (!enabled) {
            controller.setActivePub(undefined);
            return;
        }

        controller.setActivePub(activePub);
    }, [activePub, controller, enabled]);

    return { client, controller };
}
