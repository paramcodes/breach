# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure with Next.js 15, Tailwind v4, TypeScript
- Design tokens (orange ladder, radii)
- Shared UI primitives (Button, Input, TagPill, LiveBadge)
- Browse feature: hero carousel, live sidebar, video grid, category tiles
- Stream feature: Mux player, go-live form, webhook handler, encryption
- Chat feature: Supabase Realtime, presence, emotes, rate limiting, slow mode
- Channel feature: In-memory and Supabase repositories
- Emotes feature: Upload, moderation, R2 presigned URLs, CDN delivery
- Follow feature: Toggle, sidebar, notifications
- Search feature: Channel and category search
- Moderation feature: Ban, timeout, delete messages, mod log
- Studio dashboard: Stream status, stream key, emote management, settings
- Accessibility: WCAG AA, keyboard nav, reduced motion, screen reader support
- Dark mode with system awareness and manual toggle

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

## [0.1.0] - TBD

### Added
- First release candidate

---

## Release Process

This project uses automated releases on merge to `main`:

1. CI pipeline runs all checks (typecheck, lint, format, test, boundaries)
2. On successful build, a new release is created with tag `v<run_number>`
3. Release notes are auto-generated from this CHANGELOG
4. Manual version bumps follow semantic versioning

To release a specific version:
1. Update version in `package.json`
2. Update this CHANGELOG with the release notes
3. Create a git tag: `git tag v0.x.x`
4. Push tag: `git push origin v0.x.x`