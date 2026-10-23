import type { SupabaseClient } from "@/shared/db/client";

import type { AuthRepository, AuthService } from "./AuthRepository";
import type {
  AuthSession,
  CreateUserInput,
  SignInInput,
  SignUpInput,
  UpdateUserInput,
  User,
} from "./auth.types";

function toUser(row: unknown): User {
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id),
    email: String(r.email ?? ""),
    username: String(r.username ?? ""),
    avatarUrl: r.avatar_url == null ? null : String(r.avatar_url),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error || !data.user) return null;
    const { data: profile, error: profileError } = await this.client
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile) return toUser(profile);
    const created = await this.createUser({
      id: data.user.id,
      email: data.user.email ?? "",
      username: (data.user.email ?? "user").split("@")[0],
    });
    return created;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.client.from("users").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toUser(data) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return data ? toUser(data) : null;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const { data, error } = await this.client
      .from("users")
      .insert({
        id: input.id,
        email: input.email,
        username: input.username,
        avatar_url: input.avatarUrl ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return toUser(data);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const patch: Record<string, unknown> = {};
    if (input.email !== undefined) patch.email = input.email;
    if (input.username !== undefined) patch.username = input.username;
    if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;
    const { data, error } = await this.client
      .from("users")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toUser(data);
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.client.from("users").delete().eq("id", id);
    if (error) throw error;
  }
}

export class SupabaseAuthService implements AuthService {
  constructor(
    private readonly client: SupabaseClient,
    private readonly repository: AuthRepository,
  ) {}

  async signIn(input: SignInInput): Promise<{ user: User; session: AuthSession }> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error || !data.user || !data.session) {
      throw error ?? new Error("Sign in failed");
    }
    const user = await this.repository.getUserById(data.user.id);
    if (!user) throw new Error("User profile not found");
    return {
      user,
      session: { accessToken: data.session.access_token, userId: data.user.id },
    };
  }

  async signUp(input: SignUpInput): Promise<{ user: User; session: AuthSession }> {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (error || !data.user) {
      throw error ?? new Error("Sign up failed");
    }
    const user = await this.repository.createUser({
      id: data.user.id,
      email: input.email,
      username: input.username,
    });
    // Ensure a channel row on first login.
    await this.client.from("channels").insert({
      owner_id: user.id,
      slug: user.username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      name: user.username,
    });
    return {
      user,
      session: {
        accessToken: data.session?.access_token ?? "",
        userId: data.user.id,
      },
    };
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error || !data.user) return null;
    return { accessToken: "", userId: data.user.id };
  }
}

export function createAuthRepository(client: SupabaseClient): AuthRepository {
  return new SupabaseAuthRepository(client);
}

export function createAuthService(
  client: SupabaseClient,
  repository: AuthRepository = createAuthRepository(client),
): AuthService {
  return new SupabaseAuthService(client, repository);
}
