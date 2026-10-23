export interface SupabaseAuthUser {
  id: string;
  email?: string | null;
}

export interface SupabaseAuthSession {
  access_token: string;
  user: SupabaseAuthUser;
}

export interface SupabaseQueryBuilder {
  select(columns?: string): SupabaseQueryBuilder;
  insert(values: unknown): SupabaseQueryBuilder;
  update(values: unknown): SupabaseQueryBuilder;
  delete(): SupabaseQueryBuilder;
  eq(column: string, value: unknown): SupabaseQueryBuilder;
  order(column: string, options?: { ascending?: boolean }): SupabaseQueryBuilder;
  limit(count: number): SupabaseQueryBuilder;
  single(): Promise<{ data: unknown; error: Error | null }>;
  maybeSingle(): Promise<{ data: unknown; error: Error | null }>;
  then<TResult = { data: unknown; error: Error | null }>(
    onfulfilled?: (value: { data: unknown; error: Error | null }) => TResult | PromiseLike<TResult>,
    onrejected?: (reason: unknown) => unknown,
  ): Promise<TResult>;
}

export interface SupabaseAuthApi {
  getUser(): Promise<{
    data: { user: SupabaseAuthUser | null };
    error: Error | null;
  }>;
  signInWithPassword(credentials: { email: string; password: string }): Promise<{
    data: { user: SupabaseAuthUser | null; session: SupabaseAuthSession | null };
    error: Error | null;
  }>;
  signUp(credentials: { email: string; password: string }): Promise<{
    data: { user: SupabaseAuthUser | null; session: SupabaseAuthSession | null };
    error: Error | null;
  }>;
  signOut(): Promise<{ error: Error | null }>;
}

export interface SupabaseClient {
  from(table: string): SupabaseQueryBuilder;
  auth: SupabaseAuthApi;
}

export type DatabaseClient = SupabaseClient;

export function createClient(url: string, anonKey: string): SupabaseClient {
  const baseUrl = url.replace(/\/$/, "");
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
  };

  function from(table: string): SupabaseQueryBuilder {
    let filters = "";
    let body: unknown;
    let method = "GET";
    const builder: SupabaseQueryBuilder = {
      select(_columns?: string) {
        method = "GET";
        return builder;
      },
      insert(values: unknown) {
        method = "POST";
        body = values;
        return builder;
      },
      update(values: unknown) {
        method = "PATCH";
        body = values;
        return builder;
      },
      delete() {
        method = "DELETE";
        return builder;
      },
      eq(column: string, value: unknown) {
        filters += `${filters ? "&" : "?"}${column}=eq.${encodeURIComponent(String(value))}`;
        return builder;
      },
      order(column: string, options?: { ascending?: boolean }) {
        filters += `${filters ? "&" : "?"}order=${column}.${options?.ascending === false ? "desc" : "asc"}`;
        return builder;
      },
      limit(count: number) {
        filters += `${filters ? "&" : "?"}limit=${count}`;
        return builder;
      },
      async single() {
        const result = await run();
        const rows = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
        return { data: rows[0] ?? null, error: result.error };
      },
      async maybeSingle() {
        const result = await run();
        const rows = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
        return { data: rows[0] ?? null, error: result.error };
      },
      // biome-ignore lint/suspicious/noThenProperty: query builder is thenable by design
      then<TResult = { data: unknown; error: Error | null }>(
        onfulfilled?: (value: {
          data: unknown;
          error: Error | null;
        }) => TResult | PromiseLike<TResult>,
        onrejected?: (reason: unknown) => unknown,
      ): Promise<TResult> {
        const promise = run();
        if (onfulfilled || onrejected) {
          return promise.then(
            (value) => (onfulfilled ? onfulfilled(value) : (value as TResult)),
            (reason) => (onrejected ? onrejected(reason) : Promise.reject(reason)),
          ) as Promise<TResult>;
        }
        return promise as Promise<TResult>;
      },
    };

    async function run(): Promise<{ data: unknown; error: Error | null }> {
      try {
        const response = await fetch(`${baseUrl}/rest/v1/${table}${filters}`, {
          method,
          headers: {
            ...headers,
            Prefer: method === "POST" ? "return=representation" : "return=representation",
          },
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
          const text = await response.text();
          return { data: null, error: new Error(text || response.statusText) };
        }
        const data = await response.json().catch(() => null);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
      }
    }

    return builder;
  }

  const auth: SupabaseAuthApi = {
    async getUser() {
      return { data: { user: null }, error: null };
    },
    async signInWithPassword() {
      return {
        data: { user: null, session: null },
        error: new Error("Auth requires Supabase SDK; use @supabase/supabase-js"),
      };
    },
    async signUp() {
      return {
        data: { user: null, session: null },
        error: new Error("Auth requires Supabase SDK; use @supabase/supabase-js"),
      };
    },
    async signOut() {
      return { error: null };
    },
  };

  return { from, auth };
}

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey);
}
