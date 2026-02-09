import { XmlBuilder } from "../xml/XmlBuilder";

export type DemoAuthParams = {
    cookie: string;
    platform?: string;
    bundle?: string;
    sign?: string;
};

export class AuthCommand {
    static buildDemo(params: DemoAuthParams): string {
        const credentials = XmlBuilder.element("credentials", {}, [
            XmlBuilder.element("type", { value: "demo" }),
            XmlBuilder.element("platform", { value: params.platform ?? "sa" }),
            XmlBuilder.element("bundle", { value: params.bundle ?? "com.globogames.skillgames-demo" }),
            XmlBuilder.element("cookie", { value: params.cookie })
        ]);

        return XmlBuilder.buildRequest("auth", { sign: params.sign ?? "1" }, [credentials]);
    }
}
