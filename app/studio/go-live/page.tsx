import type { Metadata } from "next";

import { GoLivePage } from "@/features/stream";

export const metadata: Metadata = {
  title: "Go live | Twitch Clone",
  description: "Start a live stream.",
};

export default function GoLiveRoute() {
  return <GoLivePage />;
}
