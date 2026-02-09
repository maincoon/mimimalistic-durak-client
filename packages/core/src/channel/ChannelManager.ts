import { ChannelInfo, MessageType, OpenCommand, Pack, Response, XmlParser, parseChannelInfo } from "@updau/protocol";
import { Channel } from "./Channel";
import { TransportLike } from "../transport/TransportLike";
import { ChannelState } from "./ChannelState";

export class ChannelManager {
    private transport: TransportLike;
    private parser: XmlParser;
    private channels = new Map<string, Channel>();

    constructor(transport: TransportLike, parser: XmlParser) {
        this.transport = transport;
        this.parser = parser;
    }

    getChannel(pub: string): Channel | undefined {
        return this.channels.get(pub);
    }

    open(pub?: string, token?: string): Promise<ChannelInfo> {
        if (!token) {
            return Promise.reject(new Error("Missing session token for open"));
        }

        const requestXml = OpenCommand.build(pub, token);

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
                    const openResponse = responses.find(
                        (item) => item.type === MessageType.RESPONSE && item.cmd === "open"
                    ) as Response | undefined;

                    if (!openResponse) {
                        return;
                    }

                    const errorElement = openResponse.element.querySelector("error");
                    if (errorElement) {
                        const code = errorElement.getAttribute("code");
                        const details = (errorElement.textContent ?? "").trim() || "open failed";
                        cleanup();
                        reject(new Error(code ? `Open failed (${code}): ${details}` : `Open failed: ${details}`));
                        return;
                    }

                    const channelElement = openResponse.element.querySelector("channel");
                    const channelInfo = channelElement
                        ? parseChannelInfo(channelElement)
                        : this.parseOpenFallback(openResponse);

                    if (!channelInfo.pub) {
                        cleanup();
                        reject(new Error("Open response did not include channel pub"));
                        return;
                    }

                    this.ensureChannel(channelInfo);
                    cleanup();
                    resolve(channelInfo);
                } catch (err) {
                    cleanup();
                    reject(err instanceof Error ? err : new Error(String(err)));
                }
            };

            timeout = setTimeout(() => {
                cleanup();
                reject(new Error("Open channel timed out"));
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

    ensureChannel(info: ChannelInfo): Channel {
        const existing = this.channels.get(info.pub);
        if (existing) {
            if (info.state) {
                existing.setState(info.state as ChannelState);
            }
            return existing;
        }

        const channel = new Channel(
            info.pub,
            info.tag,
            (info.state as ChannelState) ?? ChannelState.FREE
        );
        this.channels.set(info.pub, channel);
        return channel;
    }

    private unpack(message: Response | Pack | any): Array<Response> {
        if (message.type === MessageType.PACK) {
            return (message as Pack).messages.filter(
                (item) => item.type === MessageType.RESPONSE
            ) as Response[];
        }

        if (message.type === MessageType.RESPONSE) {
            return [message as Response];
        }

        return [];
    }

    private parseOpenFallback(response: Response): ChannelInfo {
        const stateElement = response.element.querySelector("state");
        return {
            pub: response.pub ?? response.element.getAttribute("pub") ?? "",
            tag: response.element.getAttribute("tag") ?? undefined,
            state: stateElement?.getAttribute("value") ?? undefined
        };
    }
}
