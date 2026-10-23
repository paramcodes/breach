import type { StudioRepository, StudioSettings, StudioStreamStatus } from "./studio.repository";
import { defaultStudioRepository } from "./studio.repository";

export function createStudioUseCases(repository: StudioRepository = defaultStudioRepository) {
  return {
    async loadDashboard(
      channelId: string,
    ): Promise<{ status: StudioStreamStatus; settings: StudioSettings }> {
      const [status, settings] = await Promise.all([
        repository.getStreamStatus(channelId),
        repository.getSettings(channelId),
      ]);
      return { status, settings };
    },
    async saveSettings(settings: StudioSettings): Promise<StudioSettings> {
      return repository.saveSettings(settings);
    },
  };
}
