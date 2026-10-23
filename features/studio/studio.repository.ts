export interface StudioStreamStatus {
  channelId: string;
  isLive: boolean;
  title: string | null;
  viewerCount: number;
}

export interface StudioSettings {
  channelId: string;
  title: string;
  category: string | null;
}

export interface StudioRepository {
  getStreamStatus(channelId: string): Promise<StudioStreamStatus>;
  getSettings(channelId: string): Promise<StudioSettings>;
  saveSettings(settings: StudioSettings): Promise<StudioSettings>;
}

export class InMemoryStudioRepository implements StudioRepository {
  private readonly statuses = new Map<string, StudioStreamStatus>();
  private readonly settings = new Map<string, StudioSettings>();

  async getStreamStatus(channelId: string): Promise<StudioStreamStatus> {
    return (
      this.statuses.get(channelId) ?? { channelId, isLive: false, title: null, viewerCount: 0 }
    );
  }
  async getSettings(channelId: string): Promise<StudioSettings> {
    return this.settings.get(channelId) ?? { channelId, title: "", category: null };
  }
  async saveSettings(settings: StudioSettings): Promise<StudioSettings> {
    this.settings.set(settings.channelId, settings);
    return settings;
  }
}

export const defaultStudioRepository = new InMemoryStudioRepository();
