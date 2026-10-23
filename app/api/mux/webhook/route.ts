import { createHmac, timingSafeEqual } from "node:crypto";
import {
  handleMuxWebhook,
  InMemoryStreamRepository,
  parseMuxWebhookEvent,
} from "@/features/stream";

const repository = new InMemoryStreamRepository();

export function verifyMuxSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});
  const timestamp = parts.t;
  const hash = parts.v1;
  if (!timestamp || !hash) return false;
  const toleranceMs = 5 * 60 * 1000;
  if (Math.abs(Date.now() - Number(timestamp) * 1000) > toleranceMs) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature =
    request.headers.get("mux-signature") ??
    request.headers.get("Mux-Signature") ??
    request.headers.get("x-mux-signature");
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (secret && !verifyMuxSignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: ReturnType<typeof parseMuxWebhookEvent>;
  try {
    event = parseMuxWebhookEvent(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  try {
    await handleMuxWebhook(event as never, repository);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Webhook handling failed", {
      status: 500,
    });
  }

  return Response.json({ received: true });
}

export { handleMuxWebhook };
