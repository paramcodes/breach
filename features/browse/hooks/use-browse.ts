"use client";

import { useEffect, useState } from "react";

import type { BrowseHomeData } from "../browse.types";
import { loadBrowseHome } from "../use-cases";

export function useBrowse(initialData?: BrowseHomeData) {
  const [data, setData] = useState<BrowseHomeData | null>(initialData ?? null);
  const [loading, setLoading] = useState(initialData === undefined);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (initialData) return;
    let active = true;
    loadBrowseHome()
      .then((result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause : new Error(String(cause)));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [initialData]);

  return { data, loading, error };
}
