import type { Metadata } from "next";

import { BrowsePage, loadBrowseHome } from "@/features/browse";

export const metadata: Metadata = {
  title: "Browse | Twitch Clone",
  description: "Live streams, categories, and channels to watch right now.",
};

export default async function BrowseRoute() {
  const data = await loadBrowseHome();
  return <BrowsePage initialData={data} />;
}
