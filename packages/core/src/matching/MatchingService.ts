import {
    BeginEvent,
    FindCommand,
    MessageType,
    Pack,
    XmlParser,
    parseBeginEvent,
    parseFoundEvent
} from "@updau/protocol";
import { BeginCommand } from "@updau/protocol";
import { TransportLike } from "../transport/TransportLike";
import { MatchingCriteria } from "./MatchingCriteria";

export type FoundEvent = ReturnType<typeof parseFoundEvent>;

export class MatchingService {
    private transport: TransportLike;
    private parser: XmlParser;

    constructor(transport: TransportLike, parser: XmlParser) {
        this.transport = transport;
        this.parser = parser;
    }

    find(pub: string, criteria: MatchingCriteria): Promise<FoundEvent> {
        const requestXml = FindCommand.build(pub, criteria);
        const wait = this.waitForAction("found", "find");
        try {
            this.transport.send(requestXml);
        } catch (err) {
            return Promise.reject(err instanceof Error ? err : new Error(String(err)));
        }
        return wait.then((action) =>
            parseFoundEvent(action.element, action.pub)
        );
    }

    begin(pub: string): Promise<BeginEvent> {
        const requestXml = BeginCommand.build(pub);
        const wait = this.waitForAction("begin", "begin");
        try {
            this.transport.send(requestXml);
        } catch (err) {
            return Promise.reject(err instanceof Error ? err : new Error(String(err)));
        }
        return wait.then((action) =>
            parseBeginEvent(action.element, action.pub)
        );
    }

    private waitForAction(actionCmd: string, requestCmd: string): Promise<{ pub?: string; element: Element }> {
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
                    const responses = this.unpackResponses(message);
                    const errorResponse = responses.find(
                        (item) => item.element.querySelector("error") && item.cmd === requestCmd
                    );
                    if (errorResponse) {
                        const errorElement = errorResponse.element.querySelector("error");
                        const code = errorElement?.getAttribute("code");
                        const details = (errorElement?.textContent ?? "").trim() || `${requestCmd} failed`;
                        const snapshot = errorResponse.element.outerHTML;
                        cleanup();
                        reject(new Error(code ? `${requestCmd} failed (${code}): ${details}. Response: ${snapshot}` : `${requestCmd} failed: ${details}. Response: ${snapshot}`));
                        return;
                    }

                    const actions = this.unpackActions(message);
                    const target = actions.find(
                        (action) => action.element.getAttribute("cmd") === actionCmd
                    );
                    if (!target) {
                        return;
                    }
                    cleanup();
                    resolve({ pub: target.pub, element: target.element });
                } catch (err) {
                    cleanup();
                    reject(err instanceof Error ? err : new Error(String(err)));
                }
            };

            timeout = setTimeout(() => {
                cleanup();
                reject(new Error(`${requestCmd} timed out`));
            }, 12000);

            this.transport.on("message", handler);
        });
    }

    private unpackActions(message: any): Array<{ pub?: string; element: Element }> {
        if (message.type === MessageType.PACK) {
            return (message as Pack).messages
                .filter((item) => item.type === MessageType.ACTION)
                .map((item) => ({ pub: item.pub, element: item.element }));
        }

        if (message.type === MessageType.ACTION) {
            return [{ pub: message.pub, element: message.element }];
        }

        return [];
    }

    private unpackResponses(message: any): Array<{ cmd: string; element: Element }> {
        if (message.type === MessageType.PACK) {
            return (message as Pack).messages
                .filter((item) => item.type === MessageType.RESPONSE)
                .map((item) => ({ cmd: item.cmd, element: item.element }));
        }

        if (message.type === MessageType.RESPONSE) {
            return [{ cmd: message.cmd, element: message.element }];
        }

        return [];
    }
}
