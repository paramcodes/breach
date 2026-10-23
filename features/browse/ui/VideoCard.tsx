import { LiveBadge } from "@/shared/ui/live-badge";
import { TagPill } from "@/shared/ui/tag-pill";

import type { LiveStream } from "../browse.types";
import { formatViewerLabel } from "../format";
import styles from "./browse.module.css";

type VideoCardProps = {
  stream: LiveStream;
};

export function VideoCard({ stream }: VideoCardProps) {
  const channelHref = `/${stream.channelSlug}`;

  return (
    <article className={styles.card}>
      <div className={styles.cardThumb}>
        <img
          className={styles.cardImage}
          src={stream.thumbnailUrl}
          alt={stream.title}
          width={640}
          height={360}
          loading="lazy"
          decoding="async"
        />
        <span className={styles.cardBadge}>
          <LiveBadge />
        </span>
        <span className={styles.cardViewers}>{formatViewerLabel(stream.viewerCount)}</span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>
          <a className={styles.cardTitleLink} href={channelHref}>
            {stream.title}
          </a>
        </h3>
        <a className={styles.cardChannel} href={channelHref}>
          {stream.channelName}
        </a>
        {stream.tags.length > 0 ? (
          <div className={styles.cardTags}>
            {stream.tags.map((tag) => (
              <TagPill key={tag}>{tag}</TagPill>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
