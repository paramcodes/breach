import type { MuxWebhookEvent } from "./stream.types";

export function parseMuxWebhookEvent(text: string): MuxWebhookEvent {
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Invalid webhook payload");
  }
  return parsed as MuxWebhookEvent;
}
