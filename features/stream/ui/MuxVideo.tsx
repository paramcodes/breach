"use client";

import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";
import MuxPlayer from "@mux/mux-player-react";
import type { RefObject } from "react";

export type MuxVideoElement = MuxPlayerRefAttributes;

type MuxVideoProps = {
  playbackId: string;
  streamType: "live" | "on-demand";
  title: string;
  poster: string | null;
  primaryColor: string;
  muted: boolean;
  autoPlay: boolean;
  playerRef: RefObject<MuxVideoElement | null>;
  onPlay: () => void;
  onPause: () => void;
  onError: () => void;
};

/**
 * The only module that touches the Mux player package, so the rest of the watch
 * surface stays renderable in tests without a browser custom element runtime.
 */
export function MuxVideo({
  playbackId,
  streamType,
  title,
  poster,
  primaryColor,
  muted,
  autoPlay,
  playerRef,
  onPlay,
  onPause,
  onError,
}: MuxVideoProps) {
  return (
    <MuxPlayer
      ref={playerRef}
      style={{ width: "100%", height: "100%" }}
      playbackId={playbackId}
      streamType={streamType}
      title={title}
      poster={poster ?? undefined}
      primaryColor={primaryColor}
      accentColor={primaryColor}
      metadataVideoTitle={title}
      muted={muted}
      autoPlay={autoPlay}
      onPlay={onPlay}
      onPause={onPause}
      onError={onError}
    />
  );
}
