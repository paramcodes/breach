"use client";

import type { FC } from "react";
import React from "react";
import { logger } from "@/shared/lib/logger";
import type { Emote, EmoteStatus } from "../emotes/emotes.types";

export type EmoteUploadFormProps = {
  channelId: string;
  onEmoteCreated: (emote: Emote) => void;
  onStatusChanged: (emoteId: string, status: EmoteStatus) => void;
  emotes: Emote[];
};

export const EmoteUploadForm: FC<EmoteUploadFormProps> = ({ channelId, onEmoteCreated }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [name, setName] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    if (!file || !name) {
      setError("Please select a file and enter a name");
      setUploading(false);
      return;
    }

    // Get the mime type from the file
    const mimeType = file.type;
    const fileSize = file.size;

    // Validate file using the validator
    const { valid, errors } = await validateEmoteFile(
      name,
      mimeType,
      fileSize,
      1, // frameCount will be checked on GIFs
    );

    if (!valid) {
      const errorKeys = Object.keys(errors);
      setError(errorKeys.length > 0 ? errorKeys[0] : "Validation failed");
      setUploading(false);
      return;
    }

    // Upload to R2 and create emote
    try {
      // In a real implementation, these would be actual R2 upload functions
      const uploadUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflare.com/${process.env.R2_BUCKET_STAGING}/emotes/${name}-${Date.now()}.${mimeType.split("/")[1]}`;

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const emote = {
        id: crypto.randomUUID(),
        channelId,
        name,
        url: uploadUrl,
        status: "pending" as EmoteStatus,
        createdAt: new Date().toISOString(),
      } as Emote;

      onEmoteCreated(emote);
    } catch (err) {
      logger.error("Emote upload failed", err);
      setError("Failed to upload emote. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="emote-name" className="block text-sm font-medium mb-2">
          Emote name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kappa"
          required
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      <div>
        <label htmlFor="emote-file" className="block text-sm font-medium mb-2">
          Emote file
        </label>
        <input
          type="file"
          accept="image/png, image/gif"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {file && (
          <p className="text-sm text-gray-600 mt-1">
            {file.name}: {formatBytes(file.size)} {file.type}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded bg-primary px-4 py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading..." : "Upload Emote"}
      </button>
    </form>
  );
};

export const EmoteStatusBadge: React.FC<{ status: EmoteStatus }> = ({ status }) => {
  const statusMap: Record<EmoteStatus, [string, string]> = {
    pending: ["pending", "opacity-50"],
    approved: ["approved", "bg-green-100 text-green-800"],
    rejected: ["rejected", "bg-red-100 text-red-800"],
  };

  const [label, className] = statusMap[status];
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};

export const EmoteCard: React.FC<{ emote: Emote }> = ({ emote }) => {
  return (
    <div className="relative group border rounded-lg p-4 transition-colors duration-200 hover:shadow-sm">
      <img
        src={emote.url}
        alt={emote.name}
        className="w-16 h-16 object-cover rounded-lg transition-opacity duration-200 group-hover:opacity-80"
        loading="lazy"
      />
      <div className="absolute top-2 right-2">
        <EmoteStatusBadge status={emote.status} />
      </div>
      <div className="absolute bottom-2 left-2">
        <span className="text-sm capitalize">{emote.name}</span>
      </div>
    </div>
  );
};

export const EmoteList: React.FC<{ emotes: Emote[] }> = ({ emotes }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {emotes.map((emote) => (
        <EmoteCard key={emote.id} emote={emote} />
      ))}
    </div>
  );
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Inline validation function for the UI component
export async function validateEmoteFile(
  name: string,
  mimeType: string,
  fileSize: number,
  frameCount: number,
): Promise<{
  valid: boolean;
  errors: {
    name?: string;
    format?: string;
    size?: string;
    frames?: string;
  };
  mimeType: string;
  fileSize: number;
  frameCount: number;
}> {
  const errors: Record<string, string> = {};

  // Validate name regex
  const EMOTE_NAME_REGEX = /^[a-zA-Z0-9_-]{1,32}$/;
  if (!EMOTE_NAME_REGEX.test(name)) {
    errors.name = "Emote name must be 1-32 alphanumeric characters, hyphens, or underscores";
  }

  // Validate format
  if (!["image/png", "image/gif"].includes(mimeType)) {
    errors.format = "Only PNG and GIF images are allowed";
  }

  // Validate size
  if (fileSize > 1024 * 1024) {
    errors.size = "File must be under 1MB";
  }

  // Validate frame count for GIFs
  if (mimeType === "image/gif" && frameCount > 60) {
    errors.frames = "GIF must have at most 60 frames";
  }

  const hasErrors = Object.keys(errors).length > 0;

  return {
    valid: !hasErrors,
    errors,
    mimeType,
    fileSize,
    frameCount,
  };
}
