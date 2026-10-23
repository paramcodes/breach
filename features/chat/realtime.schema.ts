export interface SocketMessage {
  topic: string;
  event: string;
  payload?: unknown;
  ref?: string;
}

/**
 * Parse a single Supabase Realtime (Phoenix protocol) websocket frame.
 * Lives in a *.schema.ts module so the JSON.parse boundary rule stays satisfied.
 */
export function parseSocketMessage(raw: string): SocketMessage | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).topic !== "string"
  ) {
    return null;
  }
  return parsed as SocketMessage;
}
