import type { CategoriesRepository } from "./categories.repository";
import { defaultCategoriesRepository } from "./categories.repository";
import type { Category, CategoryStreamsData } from "./categories.types";

export function createCategoriesUseCases(
  repository: CategoriesRepository = defaultCategoriesRepository,
) {
  return {
    async listCategories(): Promise<Category[]> {
      return repository.getCategories();
    },
    async loadCategoryPage(slug: string): Promise<CategoryStreamsData | null> {
      const category = await repository.getCategoryBySlug(slug);
      if (!category) return null;
      const streams = await repository.getStreamsByCategory(slug);
      return { category, streams };
    },
  };
}

export async function loadCategoryPage(
  slug: string,
  repository?: CategoriesRepository,
): Promise<CategoryStreamsData | null> {
  return createCategoriesUseCases(repository).loadCategoryPage(slug);
}
