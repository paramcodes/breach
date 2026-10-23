"use client";

import { useEffect, useState } from "react";

import { LiveBadge } from "@/shared/ui/live-badge";
import { TagPill } from "@/shared/ui/tag-pill";

import type { FeaturedStream } from "../browse.types";
import { formatViewerLabel } from "../format";
import styles from "./browse.module.css";

type HeroCarouselProps = {
  streams: FeaturedStream[];
  intervalMs?: number;
};

export function HeroCarousel({ streams, intervalMs = 4000 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || streams.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % streams.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, streams.length, intervalMs]);

  if (streams.length === 0) {
    return <p className={styles.empty}>No featured streams right now. Check back soon.</p>;
  }

  const currentIndex = index % streams.length;
  const current = streams[currentIndex] as FeaturedStream;
  const next = streams.length > 1 ? streams[(currentIndex + 1) % streams.length] : null;

  const move = (step: number) => {
    setIndex((value) => (value + step + streams.length) % streams.length);
  };

  return (
    <section
      className={styles.hero}
      aria-label="Featured live streams"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <img
        className={styles.heroImage}
        src={current.thumbnailUrl}
        alt={current.title}
        width={640}
        height={360}
        fetchPriority="high"
      />
      <div className={styles.heroOverlay}>
        <div className={styles.heroMeta}>
          <LiveBadge />
          <span>{formatViewerLabel(current.viewerCount)}</span>
        </div>
        <h2 className={styles.heroTitle}>{current.title}</h2>
        <a className={styles.heroChannel} href={`/${current.channelSlug}`}>
          {current.channelName}
        </a>
        <div className={styles.heroTags}>
          {current.tags.map((tag) => (
            <TagPill key={tag}>{tag}</TagPill>
          ))}
        </div>
      </div>
      <div className={styles.heroControls}>
        <button
          type="button"
          className={styles.heroControl}
          aria-label="Previous featured stream"
          onClick={() => move(-1)}
        >
          <span aria-hidden="true">&lsaquo;</span>
        </button>
        <button
          type="button"
          className={styles.heroControl}
          aria-label="Next featured stream"
          onClick={() => move(1)}
        >
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      </div>
      {next ? (
        <button
          type="button"
          className={styles.heroPeek}
          aria-label={`Show next featured stream: ${next.title}`}
          onClick={() => move(1)}
        >
          <img
            className={styles.heroPeekImage}
            src={next.thumbnailUrl}
            alt=""
            width={120}
            height={68}
          />
        </button>
      ) : null}
    </section>
  );
}
