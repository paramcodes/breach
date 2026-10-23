import type { LiveStream } from "../browse.types";
import styles from "./browse.module.css";
import { VideoCard } from "./VideoCard";

type VideoGridProps = {
  streams: LiveStream[];
};

export function VideoGrid({ streams }: VideoGridProps) {
  return (
    <section aria-labelledby="video-grid-title">
      <h2 id="video-grid-title" className={styles.sectionTitle}>
        Live on Twitch
      </h2>
      {streams.length === 0 ? (
        <p className={styles.empty}>No live streams right now. Check back soon.</p>
      ) : (
        <div className={styles.videoGrid}>
          {streams.map((stream) => (
            <VideoCard key={stream.id} stream={stream} />
          ))}
        </div>
      )}
    </section>
  );
}
