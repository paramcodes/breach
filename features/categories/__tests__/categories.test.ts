import { expect, test } from "vitest";
import { createCategoriesUseCases } from "../categories.use-cases";

test("lists categories", async () => {
  const useCases = createCategoriesUseCases();
  const cats = await useCases.listCategories();
  expect(cats.length).toBeGreaterThan(0);
});

test("loads category page", async () => {
  const useCases = createCategoriesUseCases();
  const data = await useCases.loadCategoryPage("valorant");
  expect(data?.category.slug).toBe("valorant");
});

test("missing category returns null", async () => {
  const useCases = createCategoriesUseCases();
  const data = await useCases.loadCategoryPage("nope");
  expect(data).toBeNull();
});
