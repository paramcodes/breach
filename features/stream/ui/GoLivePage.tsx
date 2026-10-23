"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { Button, Input } from "@/shared/ui";

export function GoLivePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [result, setResult] = useState<{
    rtmpUrl: string;
    streamKey: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    setResult({
      rtmpUrl: "rtmps://global-live.mux.com:443/app",
      streamKey: `sk_${title.replace(/\s+/g, "_").toLowerCase()}`,
    });
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Go live</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label htmlFor="title" style={{ display: "grid", gap: 4 }}>
          <span>Title</span>
          <Input
            id="title"
            name="title"
            aria-label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Stream title"
          />
        </label>
        <label htmlFor="category" style={{ display: "grid", gap: 4 }}>
          <span>Category</span>
          <Input
            id="category"
            name="category"
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
          />
        </label>
        <label htmlFor="tags" style={{ display: "grid", gap: 4 }}>
          <span>Tags</span>
          <Input
            id="tags"
            name="tags"
            aria-label="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma separated tags"
          />
        </label>
        {error ? <p style={{ color: "#eb0400" }}>{error}</p> : null}
        <Button type="submit">Go live</Button>
      </form>
      {result ? (
        <section style={{ marginTop: 24, display: "grid", gap: 8 }}>
          <div>
            <strong>RTMP URL</strong>
            <code data-testid="rtmp-url" style={{ display: "block" }}>
              {result.rtmpUrl}
            </code>
          </div>
          <div>
            <strong>Stream key</strong>
            <code data-testid="stream-key" style={{ display: "block" }}>
              {result.streamKey}
            </code>
          </div>
        </section>
      ) : null}
    </main>
  );
}
