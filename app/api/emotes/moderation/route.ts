import type { NextRequest } from "next/server";
import type { Emote, EmoteStatus } from "@/features/emotes";
import { createClient } from "@/shared/db/client";
import { logger } from "@/shared/lib/logger";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { emoteId, status } = body;

    if (!emoteId || !status || !["approved", "rejected"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid emote ID or status" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    );

    // Check emote exists and get channel_id
    const { data: emote, error: emoteError } = (await supabase
      .from("emotes")
      .select("channel_id")
      .eq("id", emoteId)
      .single()) as {
      data: { channel_id: string; status: EmoteStatus } | null;
      error: Error | null;
    };

    if (emoteError || !emote) {
      return new Response(JSON.stringify({ error: "Emote not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check that the user is the channel owner
    const { data: channel, error: channelError } = (await supabase
      .from("channels")
      .select("owner_id")
      .eq("id", emote.channel_id)
      .single()) as {
      data: { owner_id: string } | null;
      error: Error | null;
    };

    if (channelError || !channel || user.id !== channel.owner_id) {
      return new Response(JSON.stringify({ error: "Unauthorized: not channel owner" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update emote status
    const { data, error } = (await supabase
      .from("emotes")
      .update({ status })
      .eq("id", emoteId)
      .select()
      .single()) as {
      data: Emote;
      error: Error;
    };

    if (error) throw error;

    return new Response(JSON.stringify({ emote: data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    logger.error("Failed to update emote status", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
