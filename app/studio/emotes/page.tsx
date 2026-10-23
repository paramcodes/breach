"use client";

import { EmoteList, EmoteUploadForm } from "@/features/emotes";

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
