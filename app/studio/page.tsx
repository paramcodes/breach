import { createStudioUseCases } from "@/features/studio";

export default async function StudioPage() {
  const useCases = createStudioUseCases();
  const { status, settings } = await useCases.loadDashboard("demo-channel");
  return (
    <main>
      <h1 className="text-2xl font-bold">Studio</h1>
      <p className="mt-2 text-sm">
        Live: {status.isLive ? "yes" : "no"} · viewers {status.viewerCount}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Title: {settings.title || "untitled"}</p>
    </main>
  );
}
