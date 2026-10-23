"use client";

import { useEffect, useRef, useState } from "react";

import { colors } from "@/shared/design-tokens/tokens";
import { LiveBadge } from "@/shared/ui/live-badge";
import { formatViewerCount } from "../format";
import type { WatchStream } from "../stream.types";
import { MuxVideo, type MuxVideoElement } from "./MuxVideo";
import styles from "./watch.module.css";

type StreamPlayerProps = {
  channelName: string;
  stream: WatchStream | null;
  theater: boolean;
  onToggleTheater: () => void;
};

export function StreamPlayer({ channelName, stream, theater, onToggleTheater }: StreamPlayerProps) {
  const playerRef = useRef<MuxVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [failed, setFailed] = useState(false);

  const isLive = stream?.status === "live";
  const playbackId = stream?.playbackId ?? null;
  const showPlayer = isLive && playbackId !== null && !failed;

  // Check for reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      void player.pause();
      setPlaying(false);
    } else {
      void player.play();
      setPlaying(true);
    }
  };

  const enterFullscreen = () => {
    void playerRef.current?.requestFullscreen();
  };

  const fallback = offlineCopy(isLive, channelName);

  // Apply reduced motion class to the player frame when preferred
  const playerFrameClass = reducedMotion
    ? `${styles.playerFrame} ${styles.reducedMotion}`
    : styles.playerFrame;

  return (
    <div className={playerFrameClass}>
      {showPlayer ? (
        <div className={styles.playerStage}>
          <MuxVideo
            playbackId={playbackId}
            streamType={isLive ? "live" : "on-demand"}
            title={stream?.title ?? channelName}
            poster={stream?.posterUrl ?? null}
            primaryColor={colors.cta}
            muted={muted}
            autoPlay
            playerRef={playerRef}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
        </div>
      ) : (
        <div className={styles.playerFallback} role={isLive ? "alert" : "status"}>
          <p className={styles.fallbackTitle}>{fallback.title}</p>
          <p className={styles.fallbackText}>{fallback.text}</p>
        </div>
      )}
      <div className={styles.overlay}>
        <div className={styles.overlayMeta}>
          {isLive ? <LiveBadge /> : <span className={styles.offlineChip}>OFFLINE</span>}
          {stream ? (
            <span className={styles.overlayViewers}>
              {formatViewerCount(stream.viewerCount)} watching
            </span>
          ) : null}
        </div>
        {showPlayer ? (
          <div className={styles.overlayControls}>
            <button
              type="button"
              className={styles.control}
              aria-label={playing ? "Pause stream" : "Play stream"}
              aria-pressed={!playing}
              onClick={togglePlay}
            >
              <span aria-hidden="true">{playing ? "\u275A\u275A" : "\u25B6"}</span>
            </button>
            <button
              type="button"
              className={styles.control}
              aria-label={muted ? "Unmute stream" : "Mute stream"}
              aria-pressed={muted}
              onClick={() => setMuted((value) => !value)}
            >
              <span aria-hidden="true">{muted ? "\u{1F507}" : "\u{1F50A}"}</span>
            </button>
            <button
              type="button"
              className={styles.control}
              aria-label="Toggle theater mode"
              aria-pressed={theater}
              onClick={onToggleTheater}
            >
              <span aria-hidden="true">{"\u25AD"}</span>
            </button>
            <button
              type="button"
              className={styles.control}
              aria-label="Enter fullscreen"
              onClick={enterFullscreen}
            >
              <span aria-hidden="true">{"\u26F6"}</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function offlineCopy(isLive: boolean, channelName: string): { title: string; text: string } {
  if (isLive) {
    return {
      title: "Playback unavailable",
      text: "We could not start this stream. Refresh the page to try again.",
    };
  }
  return {
    title: "This channel is offline",
    text: `${channelName} is not live right now. Check back later.`,
  };
}
