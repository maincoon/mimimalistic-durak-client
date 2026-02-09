import { Action } from "../messages/Action";
import { MessageType } from "../messages/MessageType";
import { Pack } from "../messages/Pack";
import { Request } from "../messages/Request";
import { Response } from "../messages/Response";

export class XmlParser {
    parse(xml: string): Request | Response | Action | Pack {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "text/xml");
        const root = doc.documentElement;
        if (!root) {
            throw new Error("Invalid XML");
        }

        if (root.tagName === "pack") {
            return {
                type: MessageType.PACK,
                messages: Array.from(root.children).map((child) =>
                    this.parseMessageElement(child)
                )
            };
        }

        return this.parseMessageElement(root);
    }

    parseMessageElement(element: Element): Request | Response | Action {
        switch (element.tagName) {
            case "request":
                return {
                    type: MessageType.REQUEST,
                    cmd: this.getAttr(element, "cmd"),
                    pub: this.getOptionalAttr(element, "pub"),
                    sign: this.getOptionalAttr(element, "sign"),
                    element
                };
            case "response":
                return {
                    type: MessageType.RESPONSE,
                    cmd: this.getAttr(element, "cmd"),
                    pub: this.getOptionalAttr(element, "pub"),
                    sign: this.getOptionalAttr(element, "sign"),
                    element
                };
            case "action":
                return {
                    type: MessageType.ACTION,
                    cmd: this.getAttr(element, "cmd"),
                    pub: this.getOptionalAttr(element, "pub"),
                    element
                };
            default:
                throw new Error(`Unknown message tag: ${element.tagName}`);
        }
    }

    getAttr(element: Element, name: string): string {
        const value = element.getAttribute(name);
        if (!value) {
            throw new Error(`Missing attribute ${name}`);
        }
        return value;
    }

    getOptionalAttr(element: Element, name: string): string | undefined {
        const value = element.getAttribute(name);
        return value === null ? undefined : value;
    }

    getChild(element: Element, tag: string): Element | null {
        return element.querySelector(tag);
    }

    getChildren(element: Element, tag: string): Element[] {
        return Array.from(element.getElementsByTagName(tag));
    }
}
