import { expect, test } from "vitest";
import { createStudioUseCases } from "../studio.use-cases";

test("loads dashboard", async () => {
  const useCases = createStudioUseCases();
  const { status, settings } = await useCases.loadDashboard("demo-channel");
  expect(status.channelId).toBe("demo-channel");
  expect(settings.channelId).toBe("demo-channel");
});

test("saves settings", async () => {
  const useCases = createStudioUseCases();
  const saved = await useCases.saveSettings({
    channelId: "demo-channel",
    title: "Hi",
    category: "Just Chatting",
  });
  expect(saved.title).toBe("Hi");
});
