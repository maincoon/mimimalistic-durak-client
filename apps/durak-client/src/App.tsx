import { useEffect, useMemo, useReducer, useRef } from "react";
import { LeaveCommand, MessageType, XmlParser } from "@updau/protocol";
import { ConnectionState } from "@updau/transport";
import { StateRecovery } from "@updau/core";
import { AvailableActionType, TurnAction } from "@updau/durak";
import { useConnection } from "./hooks/useConnection";
import { useSession } from "./hooks/useSession";
import { useChannel } from "./hooks/useChannel";
import { useMatching } from "./hooks/useMatching";
import { useGame } from "./hooks/useGame";
import { AppState } from "./state/AppState";
import { appReducer, initialAppModel } from "./state/appReducer";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { MatchingScreen } from "./components/MatchingScreen";
import { GameTable } from "./components/GameTable";
import { GameOverScreen } from "./components/GameOverScreen";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { InstallPWA } from "./components/InstallPWA";
import "./index.css";

export function App() {
    const [model, dispatch] = useReducer(appReducer, initialAppModel);
    const { transport, connectionState, error: connectionError } = useConnection();
    const { sessionInfo, error: sessionError } = useSession(
        transport,
        connectionState === ConnectionState.CONNECTED
    );
    const { channelPub, openChannel, clearChannel, error: channelError } = useChannel(
        transport,
        Boolean(sessionInfo),
        sessionInfo?.token
    );
    const { find, begin, error: matchingError } = useMatching(
        transport,
        model.state === AppState.MATCHING || model.state === AppState.WAITING_FOUND,
        channelPub
    );
    const { client, controller } = useGame(
        transport,
        connectionState === ConnectionState.CONNECTED,
        channelPub
    );

    const parser = useMemo(() => new XmlParser(), []);
    const readySentRef = useRef(false);

    useEffect(() => {
        if (connectionState === ConnectionState.CONNECTED) {
            dispatch({ type: "SET_STATE", state: AppState.AUTH });
        }
    }, [connectionState]);

    useEffect(() => {
        console.info("[app] state", model.state);
    }, [model.state]);

    useEffect(() => {
        if (connectionError) {
            dispatch({ type: "SET_ERROR", error: connectionError });
        }
    }, [connectionError]);

    useEffect(() => {
        if (!sessionInfo) {
            return;
        }

        const recovery = StateRecovery.fromChannels(sessionInfo.channels);
        const openTarget = recovery.pub ? openChannel(recovery.pub) : openChannel();
        openTarget
            .then((info) => dispatch({ type: "SET_CHANNEL", pub: info.pub }))
            .catch((err) => {
                dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : String(err) });
            });

        switch (recovery.mode) {
            case "PLAYING":
                dispatch({ type: "SET_STATE", state: AppState.PLAYING });
                break;
            case "WAITING_FOUND":
                dispatch({ type: "SET_STATE", state: AppState.WAITING_FOUND });
                break;
            case "WAITING_BEGIN":
                dispatch({ type: "SET_STATE", state: AppState.WAITING_BEGIN });
                break;
            default:
                dispatch({ type: "SET_STATE", state: AppState.MATCHING });
                break;
        }
    }, [sessionInfo]);

    useEffect(() => {
        if (model.state !== AppState.MATCHING || !channelPub) {
            return;
        }

        dispatch({ type: "SET_STATE", state: AppState.WAITING_FOUND });

        find()
            .then((found) => {
                if (!found) {
                    return null;
                }
                dispatch({ type: "SET_STATE", state: AppState.WAITING_BEGIN });
                return begin();
            })
            .then((beginEvent) => {
                if (beginEvent) {
                    dispatch({ type: "SET_STATE", state: AppState.PLAYING });
                }
            })
            .catch((err) => {
                dispatch({ type: "SET_ERROR", error: String(err) });
            });
    }, [begin, channelPub, find, model.state]);

    useEffect(() => {
        if (model.state !== AppState.PLAYING) {
            return;
        }

        const handler = (payload: { data: string }) => {
            const message = parser.parse(payload.data);
            const actions =
                message.type === MessageType.PACK
                    ? message.messages.filter((item) => item.type === MessageType.ACTION)
                    : message.type === MessageType.ACTION
                        ? [message]
                        : [];

            actions.forEach((action) => {
                if (action.cmd === "gameover") {
                    const myBox = client.state.myBox;
                    let result: "win" | "loss" | "draw" | undefined;

                    if (myBox !== undefined) {
                        const myResult = action.element.querySelector(`box[id="${myBox}"]`);
                        if (myResult) {
                            const place = myResult.getAttribute("place");
                            result = place === "1" ? "win" : "loss";
                        }
                    }

                    if (!result) {
                        result = client.state.hand.length === 0 ? "win" : "loss";
                        console.warn("[app] falling back to hand count result", result, { hand: client.state.hand.length, myBox });
                    }

                    if (result) {
                        dispatch({ type: "SET_RESULT", result });
                    }
                    dispatch({ type: "SET_STATE", state: AppState.GAME_OVER });
                }
            });
        };

        transport.on("message", handler);
        return () => transport.off("message", handler);
    }, [model.state, parser, transport, client.state.myBox, client]);

    useEffect(() => {
        if (sessionError || channelError || matchingError) {
            dispatch({ type: "SET_ERROR", error: sessionError || channelError || matchingError || "" });
        }
    }, [sessionError, channelError, matchingError]);

    useEffect(() => {
        if (model.state !== AppState.PLAYING || !channelPub) {
            readySentRef.current = false;
            return;
        }

        const readyAvailable = client.state.availables.some(
            (action) => action.type === AvailableActionType.READY
        );

        if (readyAvailable && !readySentRef.current) {
            readySentRef.current = true;
            controller.sendReady(channelPub);
        }

        if (!readyAvailable) {
            readySentRef.current = false;
        }
    }, [channelPub, client.state.availables, controller, model.state]);

    if (model.state === AppState.ERROR && model.error) {
        return <ErrorDisplay message={model.error} />;
    }

    return (
        <div className="app">
            <header className="app-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h1>UpDAU Durak</h1>
                    <InstallPWA />
                </div>
                <ConnectionStatus state={connectionState} />
            </header>

            {model.state === AppState.AUTH && (
                <MatchingScreen title="Authorizing" subtitle="Demo session" />
            )}

            {model.state === AppState.WAITING_FOUND && (
                <MatchingScreen title="Finding opponent" subtitle="Bots are warming up" />
            )}

            {model.state === AppState.WAITING_BEGIN && (
                <MatchingScreen title="Setting the table" subtitle="Confirming seats" />
            )}

            {model.state === AppState.PLAYING && (
                <GameTable
                    table={client.state.table}
                    timer={client.state.timer}
                    hand={client.state.hand}
                    availables={client.state.availables}
                    turns={client.state.turns}
                    onAttack={(card) => channelPub && controller.sendTurn(channelPub, TurnAction.ATTACK, card)}
                    onDefend={(attack, defend) =>
                        channelPub &&
                        controller.sendTurn(channelPub, TurnAction.DEFEND, undefined, attack, defend)
                    }
                    onTake={() => channelPub && controller.sendTurn(channelPub, TurnAction.TAKE)}
                    onFinish={() => channelPub && controller.sendTurn(channelPub, TurnAction.FINISH)}
                />
            )}

            {model.state === AppState.GAME_OVER && (
                <GameOverScreen
                    result={model.gameResult}
                    onRetry={() => {
                        if (channelPub) {
                            transport.send(LeaveCommand.build(channelPub));
                        }
                        clearChannel();
                        controller.setActivePub(undefined);
                        client.reset();
                        dispatch({ type: "SET_STATE", state: AppState.CONNECTING });
                        openChannel()
                            .then(() => dispatch({ type: "SET_STATE", state: AppState.MATCHING }))
                            .catch((err) => dispatch({ type: "SET_ERROR", error: String(err) }));
                    }}
                />
            )}

            {(model.state === AppState.CONNECTING || model.state === AppState.MATCHING) && (
                <MatchingScreen title="Connecting" subtitle="Syncing with server" />
            )}
        </div>
    );
}
