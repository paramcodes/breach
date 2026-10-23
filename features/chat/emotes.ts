import type { Emote } from "./chat.types";

export interface EmoteToken {
  type: "text" | "emote";
  value: string;
  url?: string;
}

export function approvedEmoteMap(emotes: Emote[]): Map<string, Emote> {
  const map = new Map<string, Emote>();
  for (const emote of emotes) {
    if (emote.status === "approved") map.set(emote.name, emote);
  }
  return map;
}

/**
 * Split a message body into text and emote tokens. Whitespace is preserved
 * verbatim so renderers can join tokens back into the original spacing.
 */
export function parseEmoteTokens(body: string, emotes: Emote[]): EmoteToken[] {
  const approved = approvedEmoteMap(emotes);
  return body.split(/(\s+)/).map((token) => {
    const trimmed = token.trim();
    const emote = trimmed ? approved.get(trimmed) : undefined;
    if (emote) return { type: "emote", value: trimmed, url: emote.url };
    return { type: "text", value: token };
  });
}

/** True when every word in the body is an approved emote name. */
export function isEmoteOnlyBody(body: string, emotes: Emote[]): boolean {
  const approved = approvedEmoteMap(emotes);
  const words = body.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  return words.every((word) => approved.has(word));
}
