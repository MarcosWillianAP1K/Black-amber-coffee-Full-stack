import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Coffee, RefreshCw, Wifi } from "lucide-react";
import { LoadingSpinner } from "./ui/LoadingSpinner";

export interface ServerWarmupGateProps {
    healthUrl: string;
    children: ReactNode;
    appName?: string;
    pollIntervalMs?: number;
    requestTimeoutMs?: number;
}

type GateStatus = "checking" | "waking" | "ready";

export function ServerWarmupGate({
    healthUrl,
    children,
    appName = "Black Amber Coffee",
    pollIntervalMs = 3000,
    requestTimeoutMs = 8000,
}: ServerWarmupGateProps) {
    const [status, setStatus] = useState<GateStatus>("checking");
    const [attempt, setAttempt] = useState(1);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [lastDetail, setLastDetail] = useState<string | null>(null);
    const [isCheckingNow, setIsCheckingNow] = useState(true);

    const mountedRef = useRef(true);
    const retryTimerRef = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestSeqRef = useRef(0);

    const clearPendingTimers = useCallback(() => {
        if (retryTimerRef.current !== null) {
            window.clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    const checkServerHealth = useCallback(
        async (attemptNumber: number) => {
            clearPendingTimers();

            const seq = ++requestSeqRef.current;
            const controller = new AbortController();
            abortControllerRef.current = controller;
            let didTimeout = false;

            const timeoutId = window.setTimeout(() => {
                didTimeout = true;
                controller.abort();
            }, requestTimeoutMs);

            if (mountedRef.current) {
                setAttempt(attemptNumber);
                setIsCheckingNow(true);
            }

            try {
                const response = await fetch(healthUrl, {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                    signal: controller.signal,
                });

                window.clearTimeout(timeoutId);

                if (!mountedRef.current || seq !== requestSeqRef.current) {
                    return;
                }

                if (response.ok) {
                    setLastDetail(null);
                    setIsCheckingNow(false);
                    setStatus("ready");
                    return;
                }

                throw new Error(`Servidor retornou status HTTP ${response.status}.`);
            } catch (error) {
                window.clearTimeout(timeoutId);

                if (!mountedRef.current || seq !== requestSeqRef.current) {
                    return;
                }

                const isSilentAbort =
                    !didTimeout &&
                    error instanceof DOMException &&
                    error.name === "AbortError";

                if (isSilentAbort) {
                    return;
                }

                const message = didTimeout
                    ? "Tempo limite excedido aguardando resposta inicial do servidor."
                    : error instanceof Error && error.message
                        ? error.message
                        : "Servidor ainda inicializando.";

                setStatus("waking");
                setIsCheckingNow(false);
                setLastDetail(message);

                retryTimerRef.current = window.setTimeout(() => {
                    if (mountedRef.current) {
                        void checkServerHealth(attemptNumber + 1);
                    }
                }, pollIntervalMs);
            }
        },
        [clearPendingTimers, healthUrl, pollIntervalMs, requestTimeoutMs],
    );

    useEffect(() => {
        mountedRef.current = true;
        const startTimer = window.setTimeout(() => {
            if (mountedRef.current) {
                void checkServerHealth(1);
            }
        }, 0);

        return () => {
            mountedRef.current = false;
            window.clearTimeout(startTimer);
            clearPendingTimers();
        };
    }, [checkServerHealth, clearPendingTimers]);

    useEffect(() => {
        if (status === "ready") return;

        const intervalId = window.setInterval(() => {
            if (mountedRef.current) {
                setElapsedSeconds((prev) => prev + 1);
            }
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [status]);

    if (status === "ready") {
        return <>{children}</>;
    }

    const isColdStartLikely = status === "waking" || elapsedSeconds >= 3;

    return (
        <main className="min-h-screen w-full bg-(--Page-background) text-(--Text-gray) flex items-center justify-center p-6">
            <section className="w-full max-w-md rounded-lg border border-(--Border) bg-(--Widget-background) p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 rounded-full border border-(--Border) bg-(--Select-background) flex items-center justify-center text-(--Primary)">
                    <Coffee className="w-8 h-8" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-secondary font-semibold uppercase tracking-[0.2em] text-(--Primary)">
                        {appName}
                    </p>
                    <h1 className="text-xl font-primary font-extrabold text-(--White)">
                        {isColdStartLikely
                            ? "Acordando o servidor na nuvem..."
                            : "Verificando conexão com o servidor..."}
                    </h1>
                    <p className="text-sm font-secondary text-(--Text-primary-off) leading-relaxed">
                        {isColdStartLikely
                            ? "Servidores gratuitos (como Render) hibernam por inatividade. Estamos ativando a API e o banco PostgreSQL antes de abrir o sistema."
                            : "Validando a saúde da API e do banco de dados para garantir operação segura."}
                    </p>
                </div>

                <div className="w-full rounded-md border border-(--Border)/70 bg-(--Page-background) p-4 flex flex-col gap-2 text-xs font-secondary">
                    <div className="flex items-center justify-between text-(--Text-gray)">
                        <span className="inline-flex items-center gap-2 font-medium">
                            {isCheckingNow ? (
                                <LoadingSpinner size="xs" className="text-(--Primary)" />
                            ) : (
                                <Wifi className="w-3.5 h-3.5 text-(--Warning)" aria-hidden="true" />
                            )}
                            {isCheckingNow ? "Pingando /health..." : "Aguardando nova tentativa..."}
                        </span>
                        <span className="text-(--Primary) font-semibold tabular-nums">
                            {elapsedSeconds}s
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-(--Text-primary-off)">
                        <span>Tentativa #{attempt}</span>
                        <span>Reconexão automática a cada {Math.round(pollIntervalMs / 1000)}s</span>
                    </div>

                    {lastDetail ? (
                        <p className="pt-2 border-t border-(--Border)/40 text-left text-(--Warning) break-words">
                            {lastDetail}
                        </p>
                    ) : null}
                </div>

                <button
                    type="button"
                    onClick={() => void checkServerHealth(attempt + 1)}
                    disabled={isCheckingNow}
                    className="w-full px-4 py-2.5 rounded-sm bg-(--Primary) hover:bg-(--Primary-selected) disabled:opacity-60 disabled:cursor-not-allowed text-(--Text-dark) font-primary font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                    {isCheckingNow ? (
                        <>
                            <LoadingSpinner size="sm" />
                            <span>Conectando...</span>
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4" aria-hidden="true" />
                            <span>Tentar novamente agora</span>
                        </>
                    )}
                </button>
            </section>
        </main>
    );
}
