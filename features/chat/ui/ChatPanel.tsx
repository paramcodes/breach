"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { Button } from "@/shared/ui/button";
import type { ChatSettings } from "../chat.types";
import { useChat } from "../hooks/use-chat";
import { usePresence } from "../hooks/use-presence";
import styles from "./ChatPanel.module.css";
import { EmoteText } from "./EmoteText";

type ChatPanelProps = {
  channelId: string;
  channelName: string;
};

export function ChatPanel({ channelId, channelName }: ChatPanelProps) {
  const userId = useId();
  const [draft, setDraft] = useState("");
  const { messages, emotes, settings, send, remove, updateSettings, error, sending, reload } =
    useChat(channelId, { userId, username: "you" });
  const { viewerCount } = usePresence({ channelId, userId });

  useEffect(() => {
    void reload();
  }, [reload]);

  const isOwner = (messageUserId: string) => messageUserId === userId;

  const toggle = async (patch: Partial<ChatSettings>) => {
    try {
      await updateSettings(patch);
    } catch {
      // settings update failed; UI reverts on next settings broadcast
    }
  };

  const submit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const body = draft.trim();
      if (!body || sending) return;
      await send(body);
      setDraft("");
    },
    [draft, sending, send],
  );

  return (
    <section className={styles.panel} aria-labelledby="chat-title">
      <div className={styles.header}>
        <h2 id="chat-title" className={styles.title}>
          {channelName} chat
        </h2>
        <div className={styles.meta}>
          {error && <div className={styles.error}>{error.message}</div>}
          <span className={styles.viewers}>
            {viewerCount} {viewerCount === 1 ? "viewer" : "viewers"}
          </span>
          <div className={styles.chips}>
            <Button
              variant="secondary"
              onClick={() => toggle({ slowMode: !settings.slowMode })}
              aria-pressed={settings.slowMode}
              title={settings.slowMode ? "Slow mode on" : "Slow mode off"}
            >
              {settings.slowMode ? "Slow" : "Slow off"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => toggle({ emoteOnly: !settings.emoteOnly })}
              aria-pressed={settings.emoteOnly}
              title={settings.emoteOnly ? "Emote-only on" : "Emote-only off"}
            >
              {settings.emoteOnly ? "Emotes only" : "Emotes off"}
            </Button>
          </div>
        </div>
      </div>

      <ul className={styles.list} aria-live="polite">
        {messages.map((message) => (
          <li key={message.id} className={styles.message}>
            <span className={styles.user}>
              {message.userId === userId ? "you" : message.username}
            </span>
            <EmoteText body={message.body} emotes={emotes} />
            {isOwner(message.userId) && (
              <button
                type="button"
                className={styles.delete}
                aria-label={`Delete message from ${message.username}`}
                onClick={() => void remove(message.id)}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>

      {messages.length === 0 && (
        <p className={styles.empty}>No messages yet. Say hello to {channelName}.</p>
      )}

      <form className={styles.form} onSubmit={submit}>
        <label className={styles.srOnly} htmlFor="chat-input">
          Send a message
        </label>
        <input
          id="chat-input"
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoComplete="off"
          placeholder="Send a message"
          disabled={sending}
        />
        <button type="submit" className={styles.send} disabled={sending}>
          Chat
        </button>
      </form>
    </section>
  );
}
