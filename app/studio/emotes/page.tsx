import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emotes | Twitch Clone",
  description: "Manage emotes for your channel.",
};

import { EmoteUploadForm } from "@/features/emotes/emotes-ui";
import { EmoteList } from "@/features/emotes/emotes-ui";

export default function EmotesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Emotes</h1>

      <div className="mb-6">
        <EmoteUploadForm
          channelId="ch1"
          onEmoteCreated={() => {}}
          onStatusChanged={(_emoteId, _status) => {}}
          emotes={[]}
        />
      </div>

      <EmoteList emotes={[]} />
    </div>
  );
}