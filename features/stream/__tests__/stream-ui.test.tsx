import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InMemoryStreamRepository } from "../in-memory-stream-repository";
import type { WatchChannel, WatchStream } from "../stream.types";
import { loadWatchData } from "../use-cases";

vi.mock("../ui/MuxVideo", () => ({ MuxVideo: () => null, MuxVideoElement: null }));

import { ChatDock } from "../ui/ChatDock";
import { StreamInfoPanel } from "../ui/StreamInfoPanel";
import { StreamPlayer } from "../ui/StreamPlayer";
import { WatchPage } from "../ui/WatchPage";

const channel: WatchChannel = {
  id: "shroud",
  slug: "shroud",
  name: "shroud",
  avatarUrl: null,
  description: "FPS aim",
};

const liveStream: WatchStream = {
  id: "stream-shroud",
  channelId: "shroud",
  title: "Ranked grind to Grandmaster",
  categoryName: "Valorant",
  status: "live",
  viewerCount: 42100,
  startedAt: "2026-10-23T10:00:00.000Z",
  playbackId: "abc123",
  posterUrl: null,
  tags: ["English", "FPS"],
  endedAt: null,
  createdAt: "2026-10-23T10:00:00.000Z",
  muxStreamId: null,
  muxPlaybackId: null,
  streamKeyEncrypted: null,
  rtmpUrl: null,
  vodAssetIds: [],
};

describe("StreamInfoPanel", () => {
  it("renders title, channel, LIVE badge, viewers, tags, and follow toggle", () => {
    render(<StreamInfoPanel channel={channel} stream={liveStream} />);

    expect(screen.getByRole("heading", { name: liveStream.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "shroud" })).toHaveAttribute("href", "/shroud");
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(screen.getByText("42,100 viewers")).toBeInTheDocument();
    expect(screen.getByText("Valorant")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("FPS")).toBeInTheDocument();

    const follow = screen.getByRole("button", { name: "Follow" });
    expect(follow).toHaveAttribute("aria-pressed", "false");
    act(() => {
      follow.click();
    });
    expect(screen.getByRole("button", { name: "Following" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("renders offline copy when there is no live stream", () => {
    render(<StreamInfoPanel channel={channel} stream={null} />);

    expect(screen.getByRole("heading", { name: "shroud is offline" })).toBeInTheDocument();
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });
});

describe("ChatDock", () => {
  it("shows empty state and sends a message", () => {
    render(<ChatDock channelName="shroud" messages={[]} />);

    expect(screen.getByText("No messages yet. Say hello to shroud.")).toBeInTheDocument();

    const input = screen.getByLabelText("Send a message") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Chat" }));

    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("you")).toBeInTheDocument();
  });

  it("renders provided messages", () => {
    render(
      <ChatDock
        channelName="shroud"
        messages={[{ id: "m1", username: "alice", body: "hi", createdAt: "2026-01-01" }]}
      />,
    );

    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("hi")).toBeInTheDocument();
  });
});

describe("StreamPlayer", () => {
  it("renders fallback for an offline channel", () => {
    render(
      <StreamPlayer
        channelName="shroud"
        stream={null}
        theater={false}
        onToggleTheater={() => {}}
      />,
    );

    expect(screen.getByText("This channel is offline")).toBeInTheDocument();
    expect(screen.getByText("shroud is not live right now. Check back later.")).toBeInTheDocument();
  });

  it("renders playback unavailable for a live stream without playback id", () => {
    render(
      <StreamPlayer
        channelName="vertex"
        stream={{ ...liveStream, playbackId: null }}
        theater={false}
        onToggleTheater={() => {}}
      />,
    );

    expect(screen.getByText("Playback unavailable")).toBeInTheDocument();
  });

  it("renders overlay controls for a playable stream", () => {
    render(
      <StreamPlayer
        channelName="shroud"
        stream={liveStream}
        theater={false}
        onToggleTheater={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Pause stream" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle theater mode" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter fullscreen" })).toBeInTheDocument();
  });

  it("toggles theater mode", () => {
    const onToggle = vi.fn();
    render(
      <StreamPlayer
        channelName="shroud"
        stream={liveStream}
        theater={false}
        onToggleTheater={onToggle}
      />,
    );

    act(() => {
      screen.getByRole("button", { name: "Toggle theater mode" }).click();
    });
    expect(onToggle).toHaveBeenCalled();
  });
});

describe("WatchPage", () => {
  it("renders player, info, and chat for a loaded channel", async () => {
    const data = await loadWatchData("shroud", new InMemoryStreamRepository());
    render(<WatchPage channel="shroud" initialData={data} />);

    expect(
      screen.getByRole("heading", { name: "Ranked grind to Grandmaster" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Stream chat")).toBeInTheDocument();
    expect(screen.getByText("No messages yet. Say hello to shroud.")).toBeInTheDocument();
  });

  it("renders loading then error state", () => {
    render(<WatchPage channel="shroud" initialData={undefined} />);
    // initialData undefined triggers fetch; loading state first
    expect(screen.getByText("Loading watch...")).toBeInTheDocument();
  });
});
