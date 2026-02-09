import { AuthCommand } from "@updau/protocol";
import { AuthCredentials } from "./AuthCredentials";

export class DemoAuth {
    static buildRequest(credentials: AuthCredentials): string {
        return AuthCommand.buildDemo({
            cookie: credentials.cookie,
            platform: credentials.platform,
            bundle: credentials.bundle
        });
    }
}
