import type { SupabaseClient } from "@/shared/db/client";

import type {
  AuthSession,
  CreateUserInput,
  SignInInput,
  SignUpInput,
  UpdateUserInput,
  User,
} from "./auth.types";

export interface AuthRepository {
  getCurrentUser(): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(id: string, input: UpdateUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export interface AuthService {
  signIn(input: SignInInput): Promise<{ user: User; session: AuthSession }>;
  signUp(input: SignUpInput): Promise<{ user: User; session: AuthSession }>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}

export type { SupabaseClient };
