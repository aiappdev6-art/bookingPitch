"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Msg = { role: "user" | "assistant"; content: string };

export function Chatbot() {
  const t = useTranslations("Chat");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error("chat failed");

      setMessages([...next, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: t("error") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={t("open")}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 end-5 z-50 rounded-full w-14 h-14 shadow-lg bg-[var(--primary)] text-white flex items-center justify-center hover:scale-105 transition"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 end-5 z-50 w-[min(380px,calc(100vw-2.5rem))] h-[70vh] max-h-[560px] flex flex-col rounded-2xl shadow-2xl bg-[var(--background)] border border-[var(--border)] overflow-hidden">
          <header className="px-4 py-3 bg-[var(--primary)] text-white">
            <div className="font-semibold">{t("title")}</div>
            <div className="text-xs opacity-80">{t("subtitle")}</div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-sm text-[var(--muted-foreground)] p-2">{t("greeting")}</div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ms-auto bg-[var(--primary)] text-white"
                    : "me-auto bg-[var(--muted)] text-[var(--foreground)]"
                }`}
              >
                {m.content || (loading && i === messages.length - 1 ? "…" : "")}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-[var(--border)] p-2 flex gap-2"
          >
            <input
              className="input flex-1"
              placeholder={t("placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary px-4"
            >
              {t("send")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
