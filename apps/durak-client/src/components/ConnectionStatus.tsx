import { ConnectionState } from "@updau/transport";

type Props = {
    state: ConnectionState;
};

export function ConnectionStatus({ state }: Props) {
    const label = {
        [ConnectionState.CONNECTING]: "Connecting",
        [ConnectionState.CONNECTED]: "Connected",
        [ConnectionState.DISCONNECTING]: "Disconnecting",
        [ConnectionState.DISCONNECTED]: "Disconnected"
    }[state];

    return (
        <div className={`status status-${state.toLowerCase()}`}>
            <span className="dot" />
            {label}
        </div>
    );
}
