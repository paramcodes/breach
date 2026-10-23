import type { Category, CategoryStreamsData } from "./categories.types";

const categories: Category[] = [
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

const streamsByCategory: Record<string, CategoryStreamsData["streams"]> = {
  valorant: [
    {
      id: "s1",
      title: "Ranked grind",
      channelName: "shroud",
      channelSlug: "shroud",
      viewerCount: 42100,
      thumbnailUrl: "",
      categoryName: "Valorant",
    },
  ],
  "just-chatting": [
    {
      id: "s2",
      title: "Chill music",
      channelName: "lirik",
      channelSlug: "lirik",
      viewerCount: 18300,
      thumbnailUrl: "",
      categoryName: "Just Chatting",
    },
  ],
  minecraft: [
    {
      id: "s3",
      title: "Speedrun",
      channelName: "summit1g",
      channelSlug: "summit1g",
      viewerCount: 9700,
      thumbnailUrl: "",
      categoryName: "Minecraft",
    },
  ],
};

export interface CategoriesRepository {
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getStreamsByCategory(slug: string): Promise<CategoryStreamsData["streams"]>;
}

export class InMemoryCategoriesRepository implements CategoriesRepository {
  async getCategories(): Promise<Category[]> {
    return categories;
  }
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return categories.find((c) => c.slug === slug) ?? null;
  }
  async getStreamsByCategory(slug: string): Promise<CategoryStreamsData["streams"]> {
    return streamsByCategory[slug] ?? [];
  }
}

export const defaultCategoriesRepository = new InMemoryCategoriesRepository();
