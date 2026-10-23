import type { NextRequest } from "next/server";
import type { Emote, EmoteStatus } from "@/features/emotes";
import { createClient } from "@/shared/db/client";
import { logger } from "@/shared/lib/logger";

const ACCEPTED_MIME_TYPES = ["image/png", "image/gif"] as const;
const EMOTE_NAME_REGEX = /^[a-zA-Z0-9_-]{1,32}$/;

/**
 * Generate a presigned URL for uploading an emote to R2 staging bucket.
 * The upload goes directly to R2, then the backend moderates and moves to approved.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") ?? "";
    const mimeType = searchParams.get("mimeType") ?? "";
    const channelId = searchParams.get("channelId") ?? "";

    // Validate name
    if (!EMOTE_NAME_REGEX.test(name)) {
      return new Response(JSON.stringify({ error: "Invalid emote name" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate mime type
    if (!ACCEPTED_MIME_TYPES.includes(mimeType as (typeof ACCEPTED_MIME_TYPES)[number])) {
      return new Response(
        JSON.stringify({ error: "Invalid mime type. Only PNG and GIF are allowed" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Create Supabase client for checking channel ownership
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    );

    // Check channel ownership
    const { data: channel, error: channelError } = (await supabase
      .from("channels")
      .select("owner_id")
      .eq("id", channelId)
      .single()) as {
      data: { owner_id: string } | null;
      error: Error | null;
    };

    if (channelError || !channel) {
      return new Response(JSON.stringify({ error: "Channel not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check that the user is the channel owner
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== channel.owner_id) {
      return new Response(JSON.stringify({ error: "Unauthorized: not channel owner" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate presigned URL for R2 upload
    const extension = mimeType.split("/")[1] || "png";
    const presignedUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflare.com/${process.env.R2_BUCKET_STAGING}/emotes/${name}-${Date.now()}.${extension}`;

    return new Response(JSON.stringify({ presignedUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    logger.error("Failed to generate presigned URL", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Handle the final emote creation after R2 upload completion.
 * This is called from the client after the file is uploaded to R2.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, name, r2Key, url } = body;

    if (!channelId || !name || !r2Key || !url) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    );

    // Check channel ownership
    const { data: channel, error: channelError } = (await supabase
      .from("channels")
      .select("owner_id")
      .eq("id", channelId)
      .single()) as {
      data: { owner_id: string } | null;
      error: Error | null;
    };

    if (channelError || !channel) {
      return new Response(JSON.stringify({ error: "Channel not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== channel.owner_id) {
      return new Response(JSON.stringify({ error: "Unauthorized: not channel owner" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check for duplicate name (excluding rejected emotes)
    const { data: existingEmote } = (await supabase
      .from("emotes")
      .select("id, status")
      .eq("channel_id", channelId)
      .eq("name", name)
      .maybeSingle()) as {
      data: { id: string; status: EmoteStatus } | null;
      error: Error | null;
    };

    if (existingEmote && existingEmote.status !== "rejected") {
      return new Response(
        JSON.stringify({ error: "An emote with this name already exists in this channel" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    // Create the emote with pending status
    const { data, error } = (await supabase
      .from("emotes")
      .insert({
        channel_id: channelId,
        name,
        url,
        status: "pending",
      })
      .select()
      .single()) as {
      data: Emote;
      error: Error;
    };

    if (error) throw error;

    return new Response(JSON.stringify({ emote: data }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    logger.error("Failed to create emote", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
