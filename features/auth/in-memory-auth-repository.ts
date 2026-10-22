import type { AuthRepository } from "./AuthRepository";
import type { CreateUserInput, UpdateUserInput, User } from "./auth.types";

export class InMemoryAuthRepository implements AuthRepository {
  private readonly users = new Map<string, User>();

  async getCurrentUser(): Promise<User | null> {
    const first = this.users.values().next().value;
    return first ?? null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: input.id,
      email: input.email,
      username: input.username,
      avatarUrl: input.avatarUrl ?? null,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error("User not found");
    const updated: User = {
      ...existing,
      email: input.email ?? existing.email,
      username: input.username ?? existing.username,
      avatarUrl: input.avatarUrl === undefined ? existing.avatarUrl : input.avatarUrl,
    };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }
}
