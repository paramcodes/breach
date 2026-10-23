"use client";

import { useEffect, useState } from "react";

import type { WatchData } from "../stream.types";
import { loadWatchData } from "../use-cases";

export function useWatch(slug: string, initialData?: WatchData | null) {
  const [data, setData] = useState<WatchData | null>(initialData ?? null);
  const [loading, setLoading] = useState(initialData === undefined);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (initialData !== undefined) return;
    let active = true;
    loadWatchData(slug)
      .then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, initialData]);

  return { data, loading, error };
}
