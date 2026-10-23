import { expect, test } from "vitest";
import { createSearchUseCases } from "../use-cases";

test("search returns matching channels", async () => {
  const useCases = createSearchUseCases();
  const result = await useCases.search("shroud");
  expect(result.channels.map((c: { slug: string }) => c.slug)).toContain("shroud");
});

test("search empty returns all", async () => {
  const useCases = createSearchUseCases();
  const result = await useCases.search("");
  expect(result.channels.length).toBeGreaterThan(0);
});

test("recent searches recorded", async () => {
  const useCases = createSearchUseCases();
  await useCases.search("valorant");
  const recent = await useCases.getRecentSearches();
  expect(recent).toContain("valorant");
});
