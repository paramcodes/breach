import { LiveBadge } from "@/shared/ui/live-badge";

import type { LiveChannel } from "../browse.types";
import { formatViewerCount } from "../format";
import styles from "./browse.module.css";

type SidebarRowProps = {
  channel: LiveChannel;
};

const FALLBACK_AVATAR = "https://placehold.co/80x80/7c2d12/ffffff?text=Live";

export function SidebarRow({ channel }: SidebarRowProps) {
  return (
    <a
      className={styles.sidebarRow}
      href={`/${channel.slug}`}
      aria-label={`${channel.name}, live with ${formatViewerCount(channel.viewerCount)} viewers`}
    >
      <img
        className={styles.sidebarAvatar}
        src={channel.avatarUrl ?? FALLBACK_AVATAR}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
      />
      <span className={styles.sidebarBody}>
        <span className={styles.sidebarName}>{channel.name}</span>
        <span className={styles.sidebarTitle}>{channel.title ?? "Live"}</span>
      </span>
      <span className={styles.sidebarMeta}>
        <LiveBadge />
        <span>{formatViewerCount(channel.viewerCount)}</span>
      </span>
    </a>
  );
}
