import type { CreateEmoteInput, Emote, EmoteStatus } from "../emotes/emotes.types";

export const EMOTE_MAX_SIZE = 1 * 1024 * 1024; // 1MB
export const EMOTE_MAX_FRAMES = 60;
export const EMOTE_ACCEPTED_TYPES = ["image/png", "image/gif"] as const;
export const EMOTE_NAME_REGEX = /^[a-zA-Z0-9_-]{1,32}$/;

export type EmoteValidationResult = {
  valid: boolean;
  errors: EmoteValidationErrors;
  mimeType: string;
  fileSize: number;
  frameCount: number;
};

export type EmoteUploadError =
  | "name-invalid"
  | "name-duplicate"
  | "format-invalid"
  | "size-exceeded"
  | "frames-exceeded"
  | "empty";

export interface EmoteValidationErrors {
  name?: string;
  format?: string;
  size?: string;
  frames?: string;
}

export async function validateEmoteFile(
  name: string,
  mimeType: string,
  fileSize: number,
  frameCount: number,
): Promise<EmoteValidationResult> {
  const validator = new EmoteValidator();
  return await validator.validateUpload(name, mimeType, fileSize, frameCount);
}

export class EmoteValidator {
  async validateUpload(
    name: string,
    mimeType: string,
    fileSize: number,
    frameCount: number,
  ): Promise<EmoteValidationResult> {
    const errors: EmoteValidationErrors = {};

    // Validate name regex
    if (!EMOTE_NAME_REGEX.test(name)) {
      errors.name = "Emote name must be 1-32 alphanumeric characters, hyphens, or underscores";
    }

    // Validate format
    if (!EMOTE_ACCEPTED_TYPES.includes(mimeType as (typeof EMOTE_ACCEPTED_TYPES)[number])) {
      errors.format = "Only PNG and GIF images are allowed";
    }

    // Validate size
    if (fileSize > EMOTE_MAX_SIZE) {
      errors.size = `File must be under ${EMOTE_MAX_SIZE / 1024 / 1024}MB`;
    }

    // Validate frame count for GIFs
    if (mimeType === "image/gif" && frameCount > EMOTE_MAX_FRAMES) {
      errors.frames = `GIF must have at most ${EMOTE_MAX_FRAMES} frames`;
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
}

export async function createEmoteUseCase(
  input: CreateEmoteInput & { name: string },
): Promise<Emote> {
  // Full validation happens in the API route
  // This creates the emote with pending status
  const emote: Emote = {
    id: crypto.randomUUID(),
    channelId: input.channelId,
    name: input.name,
    url: input.url ?? "",
    status: input.status ?? "pending",
    createdAt: new Date().toISOString(),
  };
  return emote;
}

export function createEmotesUseCases(deps: {
  repository: {
    listEmotes: (channelId: string, status?: EmoteStatus) => Promise<Emote[]>;
    getEmote: (id: string) => Promise<Emote | null>;
    updateEmote: (id: string, status: EmoteStatus) => Promise<Emote>;
    deleteEmote: (id: string) => Promise<void>;
  };
}) {
  const validator = new EmoteValidator();

  return {
    listEmotes: (channelId: string, status?: EmoteStatus) =>
      deps.repository.listEmotes(channelId, status),
    createEmote: async (input: CreateEmoteInput & { name: string }) => {
      const emote = await createEmoteUseCase(input);
      return emote;
    },
    getEmote: (id: string) => deps.repository.getEmote(id),
    updateEmoteStatus: async (id: string, status: EmoteStatus) =>
      deps.repository.updateEmote(id, status),
    deleteEmote: (id: string) => deps.repository.deleteEmote(id),
    validateEmoteUpload: validator.validateUpload.bind(validator),
  };
}
