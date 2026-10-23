export interface Category {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  viewerCount: number;
}

export interface CategoryStreamsData {
  category: Category;
  streams: {
    id: string;
    title: string;
    channelName: string;
    channelSlug: string;
    viewerCount: number;
    thumbnailUrl: string;
    categoryName: string;
  }[];
}
