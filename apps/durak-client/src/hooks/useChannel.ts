import { useEffect, useMemo, useState } from "react";
import { ChannelManager } from "@updau/core";
import { XmlParser } from "@updau/protocol";
import { TransportLike } from "@updau/core";

export function useChannel(transport: TransportLike, enabled: boolean, token?: string | null) {
    const [channelPub, setChannelPub] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const parser = useMemo(() => new XmlParser(), []);
    const manager = useMemo(() => new ChannelManager(transport, parser), [parser, transport]);

    const openChannel = (pub?: string) => {
        setError(null);
        return manager
            .open(pub, token ?? undefined)
            .then((info) => {
                console.info("[channel] open ok", { pub: info.pub, state: info.state });
                setChannelPub(info.pub);
                return info;
            })
            .catch((err) => {
                const message = err instanceof Error ? err.message : String(err);
                console.error("[channel] open failed", message);
                setError(message);
                throw err;
            });
    };

    return { channelPub, error, openChannel };
}
