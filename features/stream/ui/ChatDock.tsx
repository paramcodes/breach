"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import styles from "./watch.module.css";

export interface ChatMessageView {
  id: string;
  username: string;
  body: string;
  createdAt: string;
}

type ChatDockProps = {
  channelName: string;
  messages: ChatMessageView[];
};

/**
 * Chat dock shell. Messages arrive from the caller today; the chat slice wires
 * this dock to a live transport.
 */
export function ChatDock({ channelName, messages }: ChatDockProps) {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<ChatMessageView[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSent((list) => [
      ...list,
      {
        id: `local-${list.length + 1}`,
        username: "you",
        body,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
  };

  const thread = [...messages, ...sent];

  return (
    <section className={styles.chat} aria-labelledby="chat-title">
      <h2 id="chat-title" className={styles.chatTitle}>
        Stream chat
      </h2>
      <ul className={styles.chatList} aria-live="polite">
        {thread.map((message) => (
          <li key={message.id} className={styles.chatMessage}>
            <span className={styles.chatUser}>{message.username}</span>
            <span className={styles.chatBody}>{message.body}</span>
          </li>
        ))}
      </ul>
      {thread.length === 0 ? (
        <p className={styles.chatEmpty}>No messages yet. Say hello to {channelName}.</p>
      ) : null}
      <form className={styles.chatForm} onSubmit={submit}>
        <label className={styles.srOnly} htmlFor="chat-input">
          Send a message
        </label>
        <input
          id="chat-input"
          className={styles.chatInput}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Send a message"
          autoComplete="off"
        />
        <button type="submit" className={styles.chatSend} disabled={draft.trim().length === 0}>
          Chat
        </button>
      </form>
    </section>
  );
}
