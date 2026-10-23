import "@testing-library/jest-dom/vitest";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BrowseCategory, FeaturedStream, LiveChannel, LiveStream } from "../browse.types";
import { InMemoryBrowseRepository } from "../in-memory-browse-repository";
import { BrowsePage } from "../ui/BrowsePage";
import { CategoryTiles } from "../ui/CategoryTiles";
import { HeroCarousel } from "../ui/HeroCarousel";
import { SidebarLiveChannels } from "../ui/SidebarLiveChannels";
import { SidebarRow } from "../ui/SidebarRow";
import { VideoCard } from "../ui/VideoCard";
import { VideoGrid } from "../ui/VideoGrid";
import { loadBrowseHome } from "../use-cases";

const stream: LiveStream = {
  id: "s1",
  title: "Ranked grind to Grandmaster",
  channelName: "shroud",
  channelSlug: "shroud",
  viewerCount: 42100,
  thumbnailUrl: "https://example.com/stream.jpg",
  tags: ["English", "FPS"],
};

const channel: LiveChannel = {
  id: "c1",
  name: "shroud",
  slug: "shroud",
  avatarUrl: null,
  viewerCount: 42100,
  title: "Ranked grind to Grandmaster",
};

const category: BrowseCategory = {
  id: "cat2",
  slug: "valorant",
  name: "Valorant",
  imageUrl: "https://example.com/valorant.jpg",
  viewerCount: 120000,
};

const featured: FeaturedStream[] = [
  { ...stream, id: "f1", title: "First featured", featuredRank: 1 },
  { ...stream, id: "f2", title: "Second featured", featuredRank: 2 },
  { ...stream, id: "f3", title: "Third featured", featuredRank: 3 },
];

describe("VideoCard", () => {
  it("renders the title, channel link, LIVE badge, viewers, and tags", () => {
    render(<VideoCard stream={stream} />);

    expect(screen.getByRole("heading", { name: stream.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "shroud" })).toHaveAttribute("href", "/shroud");
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(screen.getByText("42,100 viewers")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("FPS")).toBeInTheDocument();
  });
});

describe("VideoGrid", () => {
  it("renders one card per live stream", () => {
    render(<VideoGrid streams={[stream, { ...stream, id: "s2", title: "Second" }]} />);

    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText("Live on Twitch")).toBeInTheDocument();
  });

  it("shows a friendly empty state", () => {
    render(<VideoGrid streams={[]} />);

    expect(screen.getByText("No live streams right now. Check back soon.")).toBeInTheDocument();
  });
});

describe("CategoryTiles", () => {
  it("links each tile to its category route", () => {
    render(<CategoryTiles categories={[category]} />);

    expect(screen.getByRole("link", { name: /Valorant/ })).toHaveAttribute(
      "href",
      "/category/valorant",
    );
    expect(screen.getByText("120,000 viewers")).toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(<CategoryTiles categories={[]} />);

    expect(screen.getByText("No categories to browse yet.")).toBeInTheDocument();
  });
});

describe("SidebarRow", () => {
  it("renders avatar, name, title, and viewer count", () => {
    render(<SidebarRow channel={channel} />);

    const link = screen.getByRole("link", {
      name: "shroud, live with 42,100 viewers",
    });
    expect(link).toHaveAttribute("href", "/shroud");
    expect(screen.getByText("Ranked grind to Grandmaster")).toBeInTheDocument();
    expect(screen.getByText("42,100")).toBeInTheDocument();
    expect(screen.getByText("LIVE")).toBeInTheDocument();
  });
});

describe("SidebarLiveChannels", () => {
  it("shows an empty state", () => {
    render(<SidebarLiveChannels channels={[]} />);

    expect(screen.getByText("No live channels right now.")).toBeInTheDocument();
  });
});

describe("HeroCarousel", () => {
  it("shows the current featured stream and a next-stream preview", () => {
    render(<HeroCarousel streams={featured} />);

    expect(screen.getByRole("heading", { name: "First featured" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show next featured stream: Second featured" }),
    ).toBeInTheDocument();
  });

  it("advances when the next control is pressed", () => {
    render(<HeroCarousel streams={featured} />);

    act(() => {
      screen.getByRole("button", { name: "Next featured stream" }).click();
    });

    expect(screen.getByRole("heading", { name: "Second featured" })).toBeInTheDocument();
  });

  it("auto-rotates on the configured interval", () => {
    vi.useFakeTimers();
    try {
      render(<HeroCarousel streams={featured} intervalMs={1000} />);
      expect(screen.getByRole("heading", { name: "First featured" })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole("heading", { name: "Second featured" })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows an empty state", () => {
    render(<HeroCarousel streams={[]} />);

    expect(screen.getByText("No featured streams right now. Check back soon.")).toBeInTheDocument();
  });
});

describe("BrowsePage", () => {
  it("renders the banner, carousel, grid, categories, and sidebar", async () => {
    const data = await loadBrowseHome(new InMemoryBrowseRepository());
    render(<BrowsePage initialData={data} />);

    expect(screen.getByRole("heading", { name: "Orange community" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute("href", "/sign-up");
    expect(screen.getByRole("region", { name: "Featured live streams" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Live on Twitch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Live Channels" })).toBeInTheDocument();
  });
});
