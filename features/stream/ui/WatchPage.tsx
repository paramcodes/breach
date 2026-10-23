"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

import { colors } from "@/shared/design-tokens/tokens";
import { useWatch } from "../hooks/use-watch";
import type { WatchData } from "../stream.types";
import { ChatDock } from "./ChatDock";
import { StreamInfoPanel } from "./StreamInfoPanel";
import { StreamPlayer } from "./StreamPlayer";
import styles from "./watch.module.css";

type WatchPageProps = {
  channel: string;
  initialData?: WatchData | null;
};

export function WatchPage({ channel, initialData }: WatchPageProps) {
  const { data, loading, error } = useWatch(channel, initialData);
  const [theater, setTheater] = useState(false);

  if (loading) {
    return <p className={styles.pageEmpty}>Loading watch...</p>;
  }

  if (error || !data) {
    return (
      <p className={styles.pageEmpty} role="alert">
        Unable to load this channel. Try again in a moment.
      </p>
    );
  }

  const tokenVars = {
    "--watch-cta": colors.cta,
    "--watch-darkest": colors.darkest,
  } as CSSProperties;

  return (
    <div className={styles.page} data-theater={theater ? "true" : "false"} style={tokenVars}>
      <div className={styles.playerColumn}>
        <StreamPlayer
          channelName={data.channel.name}
          stream={data.stream}
          theater={theater}
          onToggleTheater={() => setTheater((value) => !value)}
        />
        <StreamInfoPanel channel={data.channel} stream={data.stream} />
      </div>
      <div className={styles.chatColumn}>
        <ChatDock channelName={data.channel.name} messages={[]} />
      </div>
    </div>
  );
}
