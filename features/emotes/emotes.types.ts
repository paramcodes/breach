export interface Emote {
  id: string;
  channelId: string;
  name: string;
  url: string;
  status: EmoteStatus;
  createdAt: string;
}

export interface CreateEmoteInput {
  channelId: string;
  name: string;
  // url is provided by the R2 presigned upload
  url?: string;
  status?: EmoteStatus;
}

export type EmoteStatus = "pending" | "approved" | "rejected";

export interface EmoteValidationErrors {
  name?: string;
  format?: string;
}

export interface EmoteUploadValidation {
  accepted: boolean;
  errors: EmoteValidationErrors;
  mimeType: string;
  fileSize: number;
  frameCount: number;
}
