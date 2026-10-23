import type { LiveChannel } from "../browse.types";
import styles from "./browse.module.css";
import { SidebarRow } from "./SidebarRow";

type SidebarLiveChannelsProps = {
  channels: LiveChannel[];
};

export function SidebarLiveChannels({ channels }: SidebarLiveChannelsProps) {
  return (
    <nav aria-labelledby="sidebar-live-title">
      <h2 id="sidebar-live-title" className={styles.sectionTitle}>
        Live Channels
      </h2>
      {channels.length === 0 ? (
        <p className={styles.empty}>No live channels right now.</p>
      ) : (
        <ul className={styles.sidebarList}>
          {channels.map((channel) => (
            <li key={channel.id}>
              <SidebarRow channel={channel} />
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
