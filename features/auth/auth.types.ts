export type UserId = string;

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CreateUserInput {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  username?: string;
  avatarUrl?: string | null;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  username: string;
}

export interface AuthSession {
  accessToken: string;
  userId: string;
}
