# Contributing to breach

Thanks for your interest in contributing! This project follows a structured development process with vertical slice PRs.

## Development workflow

1. **Fork the repo** and create a feature branch from `main`
2. **Make your changes** following the project conventions
3. **Run all checks** — `bun run check` must pass (typecheck, lint, format, test, boundaries)
4. **Open a PR** against `main` with a clear description

## PR structure

This project uses vertical slice PRs. Each PR owns one feature folder under `features/` and only touches:
- Its feature folder (`features/<name>/`)
- Shared contracts it owns (in `shared/`)
- Related app routes in `app/`

See [docs/twitch-clone-plan.md](docs/twitch-clone-plan.md) for the full PR dependency graph.

## Code standards

- **TypeScript**: Strict mode, branded IDs, Zod at boundaries, no `any`
- **React**: Server Components by default, push `use client` to leaves
- **CSS**: Tailwind v4, design tokens from `shared/design-tokens/tokens.ts`, container queries, logical properties
- **Lint/format**: Biome (run `bun run format` before committing)
- **Tests**: Vitest + React Testing Library, behavior-focused
- **Architecture**: Boundary rules enforced by `scripts/check-boundaries.mjs`

## Commit messages

Follow Conventional Commits:
- `feat: add emote upload to studio`
- `fix: handle Mux webhook race condition`
- `refactor: extract chat presence to hook`
- `perf: lazy load video grid images`
- `test: add rate limit unit tests`
- `docs: update README with video links`
- `chore: update dependencies`

Subject ≤ 50 chars, imperative mood, no trailing period.

## Testing

```bash
bun run test              # all tests
bun run test -- --watch   # watch mode
bun run test features/chat  # single feature
```

## Local development

```bash
bun install
cp .env.example .env.local  # fill in your keys
bun run dev
```

Required services:
- Supabase (local via `supabase start` or cloud)
- Mux account for live streaming
- Cloudflare R2 for emote storage

## Reporting issues

Use the GitHub issue tracker. Include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recordings
- Environment (OS, browser, Bun version)

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).