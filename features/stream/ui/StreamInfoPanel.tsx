"use client";

import { useState } from "react";

import { LiveBadge } from "@/shared/ui/live-badge";
import { TagPill } from "@/shared/ui/tag-pill";

import { formatViewerLabel } from "../format";
import type { WatchChannel, WatchStream } from "../stream.types";
import styles from "./watch.module.css";

const FALLBACK_AVATAR = "https://placehold.co/80x80/7c2d12/ffffff?text=Live";

type StreamInfoPanelProps = {
  channel: WatchChannel;
  stream: WatchStream | null;
};

export function StreamInfoPanel({ channel, stream }: StreamInfoPanelProps) {
  const [following, setFollowing] = useState(false);
  const isLive = stream?.status === "live";

  return (
    <section className={styles.info} aria-labelledby="stream-title">
      <div className={styles.infoMain}>
        <img
          className={styles.infoAvatar}
          src={channel.avatarUrl ?? FALLBACK_AVATAR}
          alt=""
          width={56}
          height={56}
        />
        <div className={styles.infoBody}>
          <h1 id="stream-title" className={styles.infoTitle}>
            {stream?.title ?? `${channel.name} is offline`}
          </h1>
          <div className={styles.infoChannelRow}>
            <a className={styles.infoChannelLink} href={`/${channel.slug}`}>
              {channel.name}
            </a>
            {isLive && stream ? (
              <>
                <LiveBadge />
                <span className={styles.infoViewers}>{formatViewerLabel(stream.viewerCount)}</span>
              </>
            ) : (
              <span className={styles.infoViewers}>Offline</span>
            )}
          </div>
          {isLive && stream ? (
            <div className={styles.infoTags}>
              {stream.categoryName ? <TagPill>{stream.categoryName}</TagPill> : null}
              {stream.tags.map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        className={following ? styles.followActive : styles.follow}
        aria-pressed={following}
        onClick={() => setFollowing((value) => !value)}
      >
        {following ? "Following" : "Follow"}
      </button>
    </section>
  );
}
