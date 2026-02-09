import { useEffect, useMemo, useState } from "react";
import { XmlParser } from "@updau/protocol";
import { Session } from "@updau/core";
import { TransportLike } from "@updau/core";

const COOKIE_KEY = "updau_demo_cookie";
const PLATFORM = "sa";
const BUNDLE = "com.globogames.skillgames-demo";

export function useSession(transport: TransportLike, enabled: boolean) {
    const [sessionInfo, setSessionInfo] = useState<Awaited<ReturnType<Session["authenticateDemo"]>> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const parser = useMemo(() => new XmlParser(), []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        setError(null);
        const cookie = getOrCreateCookie();
        const session = new Session(transport, parser);

        console.info("[session] demo auth start", { platform: PLATFORM, bundle: BUNDLE, cookie });

        session
            .authenticateDemo({ type: "demo", platform: PLATFORM, bundle: BUNDLE, cookie })
            .then((info) => {
                console.info("[session] demo auth ok", { uid: info.user.uid, channels: info.channels.length });
                setSessionInfo(info);
            })
            .catch((err) => {
                const message = err instanceof Error ? err.message : String(err);
                console.error("[session] demo auth failed", message);
                setError(message);
            });
    }, [enabled, parser, transport]);

    return { sessionInfo, error };
}

function getOrCreateCookie(): string {
    const existing = localStorage.getItem(COOKIE_KEY);
    if (existing) {
        return existing;
    }
    const value = crypto.randomUUID ? crypto.randomUUID() : fallbackUuid();
    localStorage.setItem(COOKIE_KEY, value);
    return value;
}

function fallbackUuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
