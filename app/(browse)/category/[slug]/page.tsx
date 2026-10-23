import { createCategoriesUseCases } from "@/features/categories";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const useCases = createCategoriesUseCases();
  const data = await useCases.loadCategoryPage(slug);
  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">{data.category.name}</h1>
      <ul className="mt-4 space-y-2">
        {data.streams.map((s) => (
          <li key={s.id}>
            {s.title} — {s.channelName}
          </li>
        ))}
      </ul>
    </main>
  );
}
