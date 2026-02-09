type Attributes = Record<string, string | number | undefined>;

export class XmlBuilder {
    static element(name: string, attrs: Attributes = {}, children: string[] = []): string {
        const attrText = Object.entries(attrs)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => ` ${key}="${XmlBuilder.escape(String(value))}"`)
            .join("");
        if (children.length === 0) {
            return `<${name}${attrText}/>`;
        }
        return `<${name}${attrText}>${children.join("")}</${name}>`;
    }

    static buildRequest(
        cmd: string,
        attrs: Attributes = {},
        children: string[] = []
    ): string {
        return XmlBuilder.element("request", { cmd, ...attrs }, children);
    }

    static buildResponse(
        cmd: string,
        attrs: Attributes = {},
        children: string[] = []
    ): string {
        return XmlBuilder.element("response", { cmd, ...attrs }, children);
    }

    static buildAction(
        cmd: string,
        attrs: Attributes = {},
        children: string[] = []
    ): string {
        return XmlBuilder.element("action", { cmd, ...attrs }, children);
    }

    private static escape(value: string): string {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }
}
