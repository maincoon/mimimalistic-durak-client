import { XmlBuilder } from "../xml/XmlBuilder";

export class GetProfileCommand {
    static build(): string {
        return XmlBuilder.buildRequest("getprofile");
    }
}
