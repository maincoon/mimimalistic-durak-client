import { WalletInfo, parseWalletInfo } from "../models/WalletInfo";

export type WalletEvent = {
    pub?: string;
    wallet?: WalletInfo;
};

export function parseWalletEvent(element: Element, pub?: string): WalletEvent {
    const walletElement = element.querySelector("wallet");
    return {
        pub,
        wallet: walletElement ? parseWalletInfo(walletElement) : undefined
    };
}
