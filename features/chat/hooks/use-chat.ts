"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ChatRepository } from "../ChatRepository";
import type { ChatMessage, ChatSettings, Emote } from "../chat.types";
import { DEFAULT_CHAT_SETTINGS } from "../chat.types";
import type { ChatTransport } from "../realtime";
import { createDefaultChatTransport } from "../realtime";
import { createChatUseCases } from "../use-cases";

type UseChatOptions = {
  repository?: ChatRepository;
  transport?: ChatTransport;
  userId?: string;
  username?: string;
};

export function useChat(channelId: string, options: UseChatOptions = {}) {
  const { repository, transport, userId, username } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [settings, setSettings] = useState<ChatSettings>({ ...DEFAULT_CHAT_SETTINGS });
  const [error, setError] = useState<Error | null>(null);
  const [sending, setSending] = useState(false);

  const transportRef = useRef<ChatTransport>(transport ?? createDefaultChatTransport());

  const buildUseCases = useCallback(
    () => createChatUseCases({ repository, transport: transportRef.current }),
    [repository],
  );

  const load = useCallback(async () => {
    const useCases = buildUseCases();
    const [list, approvedEmotes, nextSettings] = await Promise.all([
      useCases.listMessages(channelId),
      useCases.listEmotes(channelId, "approved"),
      useCases.getChatSettings(channelId),
    ]);
    setMessages(list);
    setEmotes(approvedEmotes);
    setSettings(nextSettings);
  }, [channelId, buildUseCases]);

  useEffect(() => {
    void load();
    const transport = transportRef.current;
    const unsub = transport.subscribeMessages(channelId, (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      });
    });
    const unsubDelete = transport.subscribeDeletes(channelId, (messageId) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });
    const unsubSettings = transport.subscribeSettings(channelId, (next) => {
      setSettings(next);
    });
    return () => {
      unsub();
      unsubDelete();
      unsubSettings();
    };
  }, [channelId, load]);

  const send = useCallback(
    async (body: string) => {
      if (!userId) throw new Error("Not signed in");
      setSending(true);
      setError(null);
      try {
        const useCases = buildUseCases();
        const message = await useCases.sendMessage({
          channelId,
          userId,
          username: username ?? "you",
          body,
        });
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        return message;
      } catch (cause: unknown) {
        const err = cause instanceof Error ? cause : new Error(String(cause));
        setError(err);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [channelId, userId, username, buildUseCases],
  );

  const remove = useCallback(
    async (id: string) => {
      const useCases = buildUseCases();
      await useCases.deleteMessage(channelId, id);
      await transportRef.current.broadcastDelete(channelId, id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    },
    [channelId, buildUseCases],
  );

  const updateSettings = useCallback(
    async (patch: Partial<ChatSettings>) => {
      const useCases = buildUseCases();
      const next = await useCases.updateChatSettings(channelId, patch);
      setSettings(next);
      await transportRef.current.broadcastSettings(channelId, next);
      return next;
    },
    [channelId, buildUseCases],
  );

  return {
    messages,
    emotes,
    settings,
    send,
    remove,
    updateSettings,
    error,
    sending,
    reload: load,
  };
}
