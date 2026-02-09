export class Wallet {
    value: string;
    currency: string;

    constructor(value: string, currency: string) {
        this.value = value;
        this.currency = currency;
    }

    update(value: string, currency: string): void {
        this.value = value;
        this.currency = currency;
    }
}
