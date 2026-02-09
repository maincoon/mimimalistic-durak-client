import { BetOption, parseBetOption } from "./BetOption";

export type CriteriaOption = {
    name: string;
    view?: string;
    options: BetOption[];
};

export function parseCriteriaOption(element: Element): CriteriaOption {
    const options = Array.from(element.getElementsByTagName("option")).map((node) =>
        parseBetOption(node)
    );
    return {
        name: element.getAttribute("name") ?? "",
        view: element.getAttribute("view") ?? undefined,
        options
    };
}
