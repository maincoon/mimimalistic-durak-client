import {
    ChannelInfo,
    MessageType,
    Pack,
    Response,
    XmlParser,
    parseChannelInfo,
    parseUserInfo
} from "@updau/protocol";
import { AuthCredentials } from "./AuthCredentials";
import { DemoAuth } from "./DemoAuth";
import { TransportLike } from "../transport/TransportLike";

export type SessionInfo = {
    user: ReturnType<typeof parseUserInfo>;
    channels: ChannelInfo[];
    token: string;
};

export class Session {
    private parser: XmlParser;
    private transport: TransportLike;

    constructor(transport: TransportLike, parser: XmlParser) {
        this.transport = transport;
        this.parser = parser;
    }

    authenticateDemo(credentials: AuthCredentials): Promise<SessionInfo> {
        const requestXml = DemoAuth.buildRequest(credentials);

        return new Promise((resolve, reject) => {
            let timeout: ReturnType<typeof setTimeout>;
            const cleanup = () => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                this.transport.off("message", handler);
            };

            const handler = (payload: { data: string }) => {
                try {
                    const message = this.parser.parse(payload.data);
                    const responses = this.unpack(message);
                    const authResponse = responses.find(
                        (item) => item.type === MessageType.RESPONSE && item.cmd === "auth"
                    ) as Response | undefined;

                    if (!authResponse) {
                        return;
                    }

                    const errorElement = authResponse.element.querySelector("error");
                    if (errorElement) {
                        const code = errorElement.getAttribute("code");
                        const details = (errorElement.textContent ?? "").trim() || "authorization failed";
                        cleanup();
                        reject(new Error(code ? `Authorization failed (${code}): ${details}` : `Authorization failed: ${details}`));
                        return;
                    }

                    const userElement = authResponse.element.querySelector("userinfo");
                    const channelElements = Array.from(
                        authResponse.element.getElementsByTagName("channel")
                    );
                    const token = this.extractToken(authResponse.element);
                    if (!token) {
                        const snapshot = authResponse.element.outerHTML;
                        cleanup();
                        reject(new Error(`Authorization succeeded but token is missing. Response: ${snapshot}`));
                        return;
                    }

                    const user = userElement ? parseUserInfo(userElement) : { uid: "", nick: "" };
                    const channels = channelElements.map((element) =>
                        parseChannelInfo(element)
                    );

                    cleanup();
                    resolve({ user, channels, token });
                } catch (err) {
                    cleanup();
                    reject(err instanceof Error ? err : new Error(String(err)));
                }
            };

            timeout = setTimeout(() => {
                cleanup();
                reject(new Error("Authorization timed out"));
            }, 8000);

            this.transport.on("message", handler);
            try {
                this.transport.send(requestXml);
            } catch (err) {
                cleanup();
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        });
    }

    private unpack(message: Response | Pack | any): Array<Response> {
        if (message.type === MessageType.PACK) {
            return (message as Pack).messages.filter(
                (item): item is Response => item.type === MessageType.RESPONSE
            );
        }

        if (message.type === MessageType.RESPONSE) {
            return [message as Response];
        }

        return [];
    }

    private extractToken(element: Element): string | null {
        const tokenElement = element.querySelector("token");
        if (!tokenElement) {
            const fromResponse = element.getAttribute("token");
            if (fromResponse && fromResponse.trim().length > 0) {
                return fromResponse.trim();
            }
            const userElement = element.querySelector("user");
            const userToken = userElement?.getAttribute("token");
            if (userToken && userToken.trim().length > 0) {
                return userToken.trim();
            }
            const userInfoElement = element.querySelector("userinfo");
            const userInfoToken = userInfoElement?.getAttribute("token");
            if (userInfoToken && userInfoToken.trim().length > 0) {
                return userInfoToken.trim();
            }
            return null;
        }
        const value = tokenElement.getAttribute("value") ?? "";
        if (value.trim().length > 0) {
            return value.trim();
        }
        const textValue = tokenElement.textContent ?? "";
        return textValue.trim().length > 0 ? textValue.trim() : null;
    }
}
