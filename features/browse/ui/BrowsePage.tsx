"use client";

import type { CSSProperties } from "react";

import { colors } from "@/shared/design-tokens/tokens";

import type { BrowseHomeData } from "../browse.types";
import { useBrowse } from "../hooks/use-browse";
import styles from "./browse.module.css";
import { CategoryTiles } from "./CategoryTiles";
import { HeroCarousel } from "./HeroCarousel";
import { SidebarLiveChannels } from "./SidebarLiveChannels";
import { VideoGrid } from "./VideoGrid";

type BrowsePageProps = {
  initialData?: BrowseHomeData;
};

const tokenVars = {
  "--browse-cta": colors.cta,
  "--browse-darkest": colors.darkest,
  "--browse-link": colors.link,
} as CSSProperties;

export function BrowsePage({ initialData }: BrowsePageProps) {
  const { data, loading, error } = useBrowse(initialData);

  if (loading) {
    return <p className={styles.empty}>Loading browse...</p>;
  }

  if (error || !data) {
    return (
      <p className={styles.empty} role="alert">
        Unable to load browse content. Try again in a moment.
      </p>
    );
  }

  return (
    <div className={styles.page} style={tokenVars}>
      <div className={styles.sidebar}>
        <SidebarLiveChannels channels={data.liveChannels} />
      </div>
      <main className={styles.main}>
        <section className={styles.banner} aria-labelledby="browse-banner-title">
          <div>
            <h1 id="browse-banner-title" className={styles.bannerTitle}>
              Orange community
            </h1>
            <p className={styles.bannerText}>Live streams, chat, and creators.</p>
          </div>
          <a className={styles.bannerAction} href="/sign-up">
            Sign Up
          </a>
        </section>
        <HeroCarousel streams={data.featured} />
        <VideoGrid streams={data.liveStreams} />
        <CategoryTiles categories={data.categories} />
      </main>
    </div>
  );
}
