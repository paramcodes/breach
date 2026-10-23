import { createSearchUseCases } from "@/features/search";

export default async function SearchPage() {
  const useCases = createSearchUseCases();
  const recent = await useCases.getRecentSearches();
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Search</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Recent searches: {recent.join(", ") || "none"}
      </p>
    </main>
  );
}
