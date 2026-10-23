import type { BrowseCategory, FeaturedStream, LiveChannel, LiveStream } from "./browse.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") throw new Error(`Invalid ${key}: expected string`);
  return value;
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error(`Invalid ${key}: expected string`);
  return value;
}

function requireNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || Number.isNaN(value))
    throw new Error(`Invalid ${key}: expected number`);
  return value;
}

function optionalNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || Number.isNaN(value))
    throw new Error(`Invalid ${key}: expected number`);
  return value;
}

function requireStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Invalid ${key}: expected string[]`);
  }
  return value;
}

function requireNullableString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(`Invalid ${key}: expected string | null`);
  return value;
}

export function parseLiveStream(input: unknown): LiveStream {
  if (!isRecord(input)) throw new Error("Invalid stream: expected object");
  return {
    id: requireString(input, "id"),
    title: requireString(input, "title"),
    channelName: requireString(input, "channelName"),
    channelSlug: requireString(input, "channelSlug"),
    viewerCount: requireNumber(input, "viewerCount"),
    thumbnailUrl: requireString(input, "thumbnailUrl"),
    tags: requireStringArray(input, "tags"),
    categoryName: optionalString(input, "categoryName"),
    startedAt:
      input.startedAt === undefined
        ? undefined
        : input.startedAt === null
          ? null
          : requireString(input, "startedAt"),
  };
}

export function parseFeaturedStream(input: unknown): FeaturedStream {
  const stream = parseLiveStream(input);
  if (!isRecord(input)) throw new Error("Invalid stream: expected object");
  const featuredRank = optionalNumber(input, "featuredRank");
  return featuredRank === undefined ? stream : { ...stream, featuredRank };
}

export function parseLiveChannel(input: unknown): LiveChannel {
  if (!isRecord(input)) throw new Error("Invalid channel: expected object");
  return {
    id: requireString(input, "id"),
    name: requireString(input, "name"),
    slug: requireString(input, "slug"),
    avatarUrl: requireNullableString(input, "avatarUrl"),
    viewerCount: requireNumber(input, "viewerCount"),
    title: requireNullableString(input, "title"),
  };
}

export function parseBrowseCategory(input: unknown): BrowseCategory {
  if (!isRecord(input)) throw new Error("Invalid category: expected object");
  return {
    id: requireString(input, "id"),
    slug: requireString(input, "slug"),
    name: requireString(input, "name"),
    imageUrl: requireString(input, "imageUrl"),
    viewerCount: requireNumber(input, "viewerCount"),
  };
}

export type Schema<T> = {
  parse: (input: unknown) => T;
  safeParse: (input: unknown) => { success: true; data: T } | { success: false; error: Error };
};

function createSchema<T>(parser: (input: unknown) => T): Schema<T> {
  return {
    parse: parser,
    safeParse(input: unknown) {
      try {
        return { success: true, data: parser(input) };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
      }
    },
  };
}

export const liveStreamSchema = createSchema(parseLiveStream);
export const featuredStreamSchema = createSchema(parseFeaturedStream);
export const liveChannelSchema = createSchema(parseLiveChannel);
export const browseCategorySchema = createSchema(parseBrowseCategory);

export function parseJSON<T>(text: string, parser: (input: unknown) => T): T {
  const parsed: unknown = JSON.parse(text);
  return parser(parsed);
}
