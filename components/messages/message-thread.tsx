"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/dashboard/toast";

const POLL_INTERVAL_MS = 15000;

type MessageRow = {
  id: string;
  senderType: "BRAND" | "ADMIN";
  body: string;
  createdAt: string;
};

export function MessageThread({ endpoint, viewerType }: { endpoint: string; viewerType: "BRAND" | "ADMIN" }) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<MessageRow[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) return;
      const data = (await res.json()) as { messages: MessageRow[] };
      setMessages(data.messages);
    } catch {
      // Silent — the next poll will retry.
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;

    const optimistic: MessageRow = {
      id: `temp-${Date.now()}`,
      senderType: viewerType,
      body: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...(prev ?? []), optimistic]);
    setDraft("");
    setSending(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) throw new Error("Failed to send");
      await load();
    } catch {
      setMessages((prev) => prev?.filter((m) => m.id !== optimistic.id) ?? null);
      setDraft(text);
      showToast("error", "Couldn't send that message. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[420px] flex-col rounded-xl border border-border bg-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages === null ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No messages yet — say hello.</p>
        ) : (
          messages.map((message) => {
            const mine = message.senderType === viewerType;
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(message.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Write a message…"
          className="max-h-32 flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
        <Button type="submit" size="icon" disabled={sending || !draft.trim()} aria-label="Send">
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </Button>
      </form>
    </div>
  );
}
