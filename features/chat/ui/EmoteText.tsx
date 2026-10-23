"use client";

import Image from "next/image";

import type { Emote } from "../chat.types";
import { parseEmoteTokens } from "../emotes";

type EmoteTextProps = {
  body: string;
  emotes: Emote[];
};

export function EmoteText({ body, emotes }: EmoteTextProps) {
  const tokens = parseEmoteTokens(body, emotes);
  return (
    <span>
      {tokens.map((token) => {
        if (token.type === "emote" && token.url) {
          return (
            <Image
              key={token.value + token.url}
              src={token.url}
              alt={token.value}
              title={token.value}
              className="chat-emote"
              width={24}
              height={24}
            />
          );
        }
        return <span key={token.value}>{token.value}</span>;
      })}
    </span>
  );
}
