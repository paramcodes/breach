import type { SearchRepository } from "./SearchRepository";
import type { SearchableCategory, SearchableChannel } from "./search.types";

const channels: SearchableChannel[] = [
  {
    id: "shroud",
    name: "shroud",
    slug: "shroud",
    avatarUrl: null,
    viewerCount: 42100,
    title: "Ranked grind",
  },
  {
    id: "lirik",
    name: "lirik",
    slug: "lirik",
    avatarUrl: null,
    viewerCount: 18300,
    title: "Chill music",
  },
  {
    id: "summit1g",
    name: "summit1g",
    slug: "summit1g",
    avatarUrl: null,
    viewerCount: 9700,
    title: "Speedrun",
  },
];

const categories: SearchableCategory[] = [
  { id: "valorant", slug: "valorant", name: "Valorant", imageUrl: "", viewerCount: 50000 },
  {
    id: "just-chatting",
    slug: "just-chatting",
    name: "Just Chatting",
    imageUrl: "",
    viewerCount: 30000,
  },
  { id: "minecraft", slug: "minecraft", name: "Minecraft", imageUrl: "", viewerCount: 15000 },
];

export class InMemorySearchRepository implements SearchRepository {
  private readonly recent: string[] = [];

  async searchChannels(query: string): Promise<SearchableChannel[]> {
    const q = query.trim().toLowerCase();
    if (!q) return channels;
    return channels.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.title ?? "").toLowerCase().includes(q),
    );
  }

  async searchCategories(query: string): Promise<SearchableCategory[]> {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }

  async getRecentSearches(): Promise<string[]> {
    return [...this.recent];
  }

  async addRecentSearch(query: string): Promise<void> {
    const q = query.trim();
    if (!q) return;
    if (!this.recent.includes(q)) this.recent.unshift(q);
    if (this.recent.length > 10) this.recent.pop();
  }
}

export const defaultSearchRepository = new InMemorySearchRepository();
