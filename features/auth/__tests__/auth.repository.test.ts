import { describe, expect, it } from "vitest";

import { InMemoryAuthRepository } from "../in-memory-auth-repository";

describe("InMemoryAuthRepository", () => {
  it("creates and retrieves a user", async () => {
    const repo = new InMemoryAuthRepository();
    const created = await repo.createUser({
      id: "u1",
      email: "a@b.com",
      username: "alice",
    });
    expect(created.id).toBe("u1");
    const found = await repo.getUserById("u1");
    expect(found?.username).toBe("alice");
  });

  it("updates a user", async () => {
    const repo = new InMemoryAuthRepository();
    await repo.createUser({ id: "u1", email: "a@b.com", username: "alice" });
    const updated = await repo.updateUser("u1", { username: "alice2" });
    expect(updated.username).toBe("alice2");
  });

  it("deletes a user", async () => {
    const repo = new InMemoryAuthRepository();
    await repo.createUser({ id: "u1", email: "a@b.com", username: "alice" });
    await repo.deleteUser("u1");
    expect(await repo.getUserById("u1")).toBeNull();
  });
});
