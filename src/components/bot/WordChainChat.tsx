"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
    role: "user" | "bot";
    text: string | null;
};

const TURN_TIME = 7; // giây

export default function WordChainChat() {
    const API_BASE = process.env.NEXT_PUBLIC_AI_WORDCHAIN_URL as string;

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "bot", text: "Nhấn Bắt đầu để chơi nối từ với mình 😄" },
    ]);
    const [input, setInput] = useState("");
    const [nextExpected, setNextExpected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ⏱ timer
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const timeoutHandledRef = useRef(false);

    // 📜 auto scroll
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const canSend = useMemo(
        () =>
            Boolean(
                sessionId &&
                !loading &&
                input.trim().length > 0 &&
                timeLeft !== 0
            ),
        [sessionId, loading, input, timeLeft]
    );

    // ================= TIMER LOGIC =================

    function startTurnTimer() {
        // reset cờ timeout cho lượt mới
        timeoutHandledRef.current = false;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setTimeLeft(TURN_TIME);

        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t === null) return null;

                if (t <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    onTimeout(); // ⛔ chỉ chạy 1 lần
                    return 0;
                }

                return t - 1;
            });
        }, 1000);
    }


    async function onTimeout() {
        // ⛔ nếu đã xử lý timeout rồi thì bỏ qua
        if (timeoutHandledRef.current) return;
        timeoutHandledRef.current = true;
        setMessages((m) => [
            ...m,
            { role: "bot", text: "⏰ Hết giờ! Bạn đã thua." },
        ]);

        if (sessionId) {
            try {
                await fetch(`${API_BASE}/sessions/${sessionId}`, {
                    method: "DELETE",
                });
            } catch { }
        }

        setSessionId(null);
        setNextExpected(null);
        setInput("");
        setTimeLeft(null);
    }

    function stopTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTimeLeft(null);
    }

    // ================= GAME ACTIONS =================

    async function startGame() {
        timeoutHandledRef.current = false;
        setLoading(true);
        stopTimer();

        try {
            const res = await fetch(`${API_BASE}/sessions`, { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data?.message || "Start failed");

            setSessionId(data.session_id);
            setMessages([{ role: "bot", text: data.message }]);
            setInput("");
            setNextExpected(null);

            startTurnTimer(); // ⏱ bắt đầu lượt đầu
        } catch (e: any) {
            setMessages((m) => [
                ...m,
                { role: "bot", text: `Lỗi start: ${e.message}` },
            ]);
        } finally {
            setLoading(false);
        }
    }

    async function sendMove() {
        if (!canSend || !sessionId) return;

        stopTimer();

        const term = input.trim();
        setInput("");
        setLoading(true);

        setMessages((m) => [...m, { role: "user", text: term }]);

        try {
            const res = await fetch(
                `${API_BASE}/sessions/${sessionId}/move`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ term }),
                }
            );

            const data = await res.json();

            if (!res.ok || data?.ok === false) {
                setMessages((m) => [
                    ...m,
                    { role: "bot", text: data?.message || "Sai luật." },
                ]);
                startTurnTimer(); // user vẫn còn lượt
                return;
            }

            const botMsg = data.messages?.find(
                (x: ChatMessage) => x.role === "bot"
            );

            if (botMsg?.text) {
                setMessages((m) => [
                    ...m,
                    { role: "bot", text: botMsg.text },
                ]);
            }

            if (data.ended) {
                setMessages((m) => [
                    ...m,
                    { role: "bot", text: data.message || "Kết thúc ván!" },
                ]);
                stopTimer();
                setNextExpected(null);
                setSessionId(null);
            } else {
                setNextExpected(data.next_expected ?? null);
                startTurnTimer(); // ⏱ lượt mới cho user
            }
        } catch (e: any) {
            setMessages((m) => [
                ...m,
                { role: "bot", text: `Lỗi gọi API: ${e.message}` },
            ]);
            startTurnTimer();
        } finally {
            setLoading(false);
        }
    }

    async function endGame() {
        timeoutHandledRef.current = false;
        stopTimer();

        if (sessionId) {
            try {
                await fetch(`${API_BASE}/sessions/${sessionId}`, {
                    method: "DELETE",
                });
            } catch { }
        }

        setSessionId(null);
        setNextExpected(null);
        setInput("");
        setMessages([
            { role: "bot", text: "Đã kết thúc. Nhấn Bắt đầu để chơi lại!" },
        ]);
    }

    // ================= UI =================

    return (
        <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                🤖 Thử tài Nối từ
            </h2>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 12,
                    height: 360,
                    overflowY: "auto",
                    background: "#fff",
                    marginTop: 10,
                }}
            >
                {messages.map((m, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            justifyContent:
                                m.role === "user" ? "flex-end" : "flex-start",
                            marginBottom: 8,
                        }}
                    >
                        <div
                            style={{
                                maxWidth: "80%",
                                padding: "8px 10px",
                                borderRadius: 12,
                                background:
                                    m.role === "user" ? "#e8f0fe" : "#f1f3f4",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            <b style={{ fontSize: 12, opacity: 0.7 }}>
                                {m.role === "user" ? "Bạn" : "Bot"}
                            </b>
                            <div>{m.text}</div>
                        </div>
                    </div>
                ))}

                {/* 👇 auto scroll anchor */}
                <div ref={bottomRef} />
            </div>

            <div
                style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                }}
            >
                <button onClick={startGame} disabled={loading}>
                    Bắt đầu
                </button>

                <button
                    onClick={endGame}
                    disabled={!sessionId || loading}
                >
                    Kết thúc
                </button>

                <div style={{ marginLeft: "auto", fontSize: 12 }}>
                    {sessionId ? (
                        nextExpected ? (
                            <>
                                Bắt đầu bằng: <b>{nextExpected}</b>
                            </>
                        ) : (
                            "Bạn nhập từ đầu tiên"
                        )
                    ) : (
                        "Chưa có session"
                    )}
                </div>
            </div>

            <div style={{ marginTop: 6, fontSize: 12 }}>
                {sessionId && timeLeft !== null && (
                    <span
                        style={{
                            color: timeLeft <= 2 ? "red" : "#555",
                        }}
                    >
                        ⏳ Còn {timeLeft}s
                    </span>
                )}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                        sessionId ? "Nhập từ..." : "Nhấn Bắt đầu trước"
                    }
                    disabled={!sessionId || loading || timeLeft === 0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMove();
                    }}
                    style={{ flex: 1 }}
                />
                <button onClick={sendMove} disabled={!canSend}>
                    Gửi
                </button>
            </div>
        </div>
    );
}
