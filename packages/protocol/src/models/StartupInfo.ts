import { WalletInfo, parseWalletInfo } from "./WalletInfo";

export type StartupInfo = {
    wallet?: WalletInfo;
};

export function parseStartupInfo(element: Element): StartupInfo {
    const walletElement = element.querySelector("wallet");
    return {
        wallet: walletElement ? parseWalletInfo(walletElement) : undefined
    };
}
