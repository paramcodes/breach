# Twitch clone (orange) multi-phase plan

Orange-themed Twitch clone built on vertical slices. Mux for video, Supabase for data and chat, R2 for emotes. Each PR is one verifiable change. Execution follows autopilot-stack.

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `playbooks/autopilot-stack.md`. The operator reviews and lands the stack. Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go.
- [ ] On the operator's go, write the program objective to `orchestrate/twitch-clone/goal.md`. Include the plan path, the PR ids in order, the verification rule, who merges, the done condition, and the run budget. Maximum wall-clock 8 hours, maximum 8 ticks.
- [ ] Read these from trunk at program start. Re-read them at every tick.
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/autopilot-stack.md`
  - [ ] `git show origin/main:pstack/skills/swarm/SKILL.md`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/opening-a-pr.md`
- [ ] Arm the hourly audit tick as a bounded local poll. One cycle per one-hour interval, counting against the tick budget. One status line per tick.
- [ ] Use the tick prompt verbatim from the playbook.
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names. One worktree per concurrently active owner. Sequential and stacked owners reuse a single checkout by branch name. Reuse an existing worktree before creating a new one.
- [ ] Spawn an owner only when its dependencies are merged or its parent branch exists. Otherwise queue it.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when stacking.
  - [ ] PR-01 and PR-02 are independent first. Both branch from main.
  - [ ] PR-03 after PR-01 and PR-02.
  - [ ] PR-04 after PR-01 and PR-02.
  - [ ] PR-05 after PR-02 and PR-04.
  - [ ] PR-06 after PR-04.
  - [ ] PR-07 after PR-06.
  - [ ] PR-08 after PR-02.
  - [ ] PR-09 after PR-03.
  - [ ] PR-10 after PR-05 and PR-07.
  - [ ] PR-11 after PR-06.
  - [ ] PR-12 after PR-03 and PR-04.
- [ ] Hold the file boundaries. PR owners touch only their feature folder and shared contracts they own.
- [ ] Hold the review gate. PR-03, PR-04, PR-06, PR-07, PR-10, and PR-12 change an interaction. They wait for operator review in chat with screenshots and a video before merge.

### PR mechanics

- [ ] Resolve the forge once. Use gh for every PR operation.
- [ ] Open the PR ready, never draft, with `gh pr create --base <base-branch>`. A stack child targets its parent branch.
- [ ] Run the repo lint and typecheck once before the PR-facing push. Push with hooks on.
- [ ] Run the local deslop skill before each commit and the no-comments skill before review.
- [ ] Triage every Bugbot and security-reviewer comment per the bugbot triage reference.
- [ ] Rebase onto current trunk before the code-ready report and babysit.
- [ ] Efficiency. No `bun run build` in any lane or gate unless the PR changes build config or `e2e/`. No E2E smoke unless `e2e/` changed. Static gates run once. Targeted tests only, `bun run test -- <feature path>`.
- [ ] Worktree discipline. Trivial single-file or doc fixes are edited on the current branch without a worktree or owner. Reserve worktrees for concurrent owners. Reuse an existing worktree by branch name before creating one. Prune lane worktrees after the verdict.
- [ ] Subagent routing. Use explorer for research and file search. Use implementer for code edits. Use test-writer for tests only. Use reviewer for audit lanes. Use debugger for root-cause. Keep each brief self-contained and scoped to one feature folder. No shared write targets.
- [ ] Commit discipline. One logical change per commit. Atomic and revertable.
- [ ] Conventional type prefix. feat, fix, refactor, perf, test, docs, chore, build, ci.
- [ ] Subject line 50 chars max. Imperative mood. Capitalized. No trailing period.
- [ ] Blank line between subject and body. Body wraps at 72 chars. Explain why, not what.
- [ ] Footer for breaking changes and issue refs. `BREAKING CHANGE:` and `Closes #id`.
- [ ] Never commit secrets, generated files, or broken code. Hooks stay on.
- [ ] Separate formatting-only commits from logic changes.
- [ ] Never amend or rebase pushed commits on shared branches.

### Verdict and merge

- [ ] At the code-ready head SHA and at each later push that changes the patch, run the swarm. One gates lane. Ten live lanes. Perf lane. Two or more audit lanes.
- [ ] Clean only when every lane is PASS.
- [ ] Append on a clean verdict. No owner merges. Operator reviews and lands.

### Boot recipe

- [ ] Each live lane runs in its own git worktree at the PR head. Drive it through control-ui for browser surfaces.
  - [ ] Reuse lane slots idempotently. `git worktree add` is a no-op if present. Prune all lane worktrees once the verdict is recorded.
  - [ ] `git fetch origin <head-branch> && git worktree add .worktrees/swarm-<pr-id>/worker-<n> <head SHA>`. Re-running reuses it.
  - [ ] Start the backend and the surface. Wait for ready. Static and read-only lanes run in the owner checkout without a dev server.
  - [ ] Deliver input only through control-ui commands. Name the read-only diagnostics.
  - [ ] Save every screenshot to `.worktrees/swarm-<pr-id>/worker-<n>/<slug>.png`.
  - [ ] Leave lane worktrees on disk until the verdict is recorded. Then remove and recycle.

## Foundation (PR-01)

**Depends on.** None.

**Files.**

- [ ] Create `package.json`, `tsconfig.json`, `biome.json`, `next.config.ts`.
- [ ] Create `shared/design-tokens/tokens.ts` with the orange ladder and radii.
- [ ] Create `shared/ui/` primitives re-skinned to tokens.
- [ ] Create `scripts/check-boundaries.mjs`.
- [ ] Create `app/layout.tsx` with providers.
- [ ] Create `e2e/` directories.

**Build.**

- [ ] Scaffold Next.js 15 with App Router, TypeScript, Tailwind, bun.
- [ ] Port Twitch tokens to orange ladder. CTA `#ea580c`, hover `#fb923c`, link `#c2410c`, pressed `#9a3412`, darkest `#7c2d12`. Keep live red `#eb0400`.
- [ ] Radius binary. 4px cards, 9000px pills, 2px LIVE badge, 6px inputs.
- [ ] Configure biome lint and format. Configure tsrs typecheck.
- [ ] Implement boundary script. Domain and feature isolation rules.

**You see.**

- [ ] `bun run check` passes on an empty feature set.
- [ ] `bun run dev` serves the home route with the orange community banner.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Boundary script passes on the scaffold. Run `bun run check:boundaries`.
- [ ] Token file compiles. Run `bun run typecheck`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no app. Record that fact. Gate that dev server starts and home renders. Save `foundation-dev.png`. Pass when the page loads with orange banner.
- [ ] Lane 2. Home route renders tokens. Save `foundation-tokens.png`. Pass when orange CTA and 9000px pill are visible.
- [ ] Lane 3. Dark mode toggle works. Save `foundation-dark.png`. Pass when dark canvas swaps.
- [ ] Lane 4. Typecheck passes in lane. Save `foundation-typecheck.png`. Pass when zero errors.
- [ ] Lane 5. Lint passes in lane. Save `foundation-lint.png`. Pass when zero errors.
- [ ] Lane 6. Boundary script passes. Save `foundation-boundaries.png`. Pass when zero violations.
- [ ] Lane 7. Biome format check passes. Save `foundation-format.png`. Pass when zero diffs.
- [ ] Lane 8. Shared UI primitives render. Save `foundation-ui.png`. Pass when button, input, tag pill render.
- [ ] Lane 9. Design tokens export. Save `foundation-export.png`. Pass when tokens import resolves.
- [ ] Lane 10. E2E smoke boots. Save `foundation-e2e.png`. Pass when agent-browser opens home.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Cold dev server start time and home LCP.
- [ ] Probe. Run `bun run dev`, measure with agent-browser Web Vitals.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget instead.
- [ ] Rule. Dev start under 5 seconds. Home LCP under 2.5 seconds.

**Review gate.** None. PR-01 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Data layer (PR-02)

**Depends on.** PR-01.

**Files.**

- [ ] Create `shared/db/client.ts`, `shared/db/schema.sql`.
- [ ] Create `features/auth/`, `features/channel/`.
- [ ] Create `features/auth/auth.types.ts`, `features/channel/channel.types.ts`.
- [ ] Create repository adapters in each feature.

**Build.**

- [ ] Supabase schema for users, channels, streams, follows, emotes, messages.
- [ ] RLS policies for channel ownership and chat insert.
- [ ] Auth integration with Clerk or Supabase Auth.
- [ ] Repository adapters implementing ports for user and channel.
- [ ] Migration files committed.

**You see.**

- [ ] A signed-in user gets a channel row on first login.
- [ ] RLS blocks cross-user writes.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Repository unit tests with fakes. Run `bun run test`.
- [ ] Migration applies cleanly. Run `supabase db reset`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no data layer. Record that fact. Gate schema applies and auth works. Save `data-auth.png`. Pass when sign-in creates a channel.
- [ ] Lane 2. Sign up flow. Save `data-signup.png`. Pass when user row and channel row exist.
- [ ] Lane 3. Sign in flow. Save `data-signin.png`. Pass when session persists.
- [ ] Lane 4. RLS read isolation. Save `data-rls-read.png`. Pass when user A cannot read user B private data.
- [ ] Lane 5. RLS write isolation. Save `data-rls-write.png`. Pass when user A cannot update user B channel.
- [ ] Lane 6. Channel fetch by slug. Save `data-channel.png`. Pass when channel page loads data.
- [ ] Lane 7. Migration idempotency. Save `data-migrate.png`. Pass when re-run is safe.
- [ ] Lane 8. Auth redirect. Save `data-redirect.png`. Pass when unauthed user redirects to sign in.
- [ ] Lane 9. Session refresh. Save `data-refresh.png`. Pass when expired session refreshes.
- [ ] Lane 10. Error state. Save `data-error.png`. Pass when DB error shows friendly message.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Functional SLA (not perf regression). Channel fetch latency and auth round-trip.
- [ ] Probe. Measure with agent-browser network panel.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. Channel fetch under 200ms. Auth round-trip under 1s.

**Review gate.** None. PR-02 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Browse feature (PR-03)

**Depends on.** PR-01 and PR-02.

**Files.**

- [ ] Create `features/browse/` with types, schema, use cases, ui, hooks.
- [ ] Create `features/browse/index.ts` public API.
- [ ] Edit `app/(browse)/page.tsx` to wire browse.

**Build.**

- [ ] Home hero carousel of featured live streams.
- [ ] Left sidebar live channels rail with viewer counts.
- [ ] Live on Twitch video grid, 3-up, with LIVE badge and tags.
- [ ] Category tiles grid.
- [ ] Tag pills and link anchors in Twitch purple-deep orange.

**You see.**

- [ ] Home shows live streams with orange CTA and LIVE red badges.
- [ ] Sidebar shows live channels with viewer counts.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Browse use case tests. Run `bun run test`.
- [ ] Component tests for video card and sidebar row.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no browse. Record that fact. Gate home renders with carousel and grid. Save `browse-home.png`. Pass when sections render.
- [ ] Lane 2. Hero carousel auto-rotates. Save `browse-carousel.png`. Pass when next stream peeks.
- [ ] Lane 3. Sidebar live channels. Save `browse-sidebar.png`. Pass when rows show avatar, name, viewers.
- [ ] Lane 4. Video grid LIVE badge. Save `browse-livebadge.png`. Pass when red LIVE badge on thumbnails.
- [ ] Lane 5. Tag pills render. Save `browse-tags.png`. Pass when tag pills show.
- [ ] Lane 6. Category tiles. Save `browse-categories.png`. Pass when tiles render with art.
- [ ] Lane 7. Orange CTA visible. Save `browse-cta.png`. Pass when orange Sign Up pill shows.
- [ ] Lane 8. Responsive collapse. Save `browse-mobile.png`. Pass when single column on mobile.
- [ ] Lane 9. Empty state. Save `browse-empty.png`. Pass when friendly empty message.
- [ ] Lane 10. Navigation to channel. Save `browse-nav.png`. Pass when click opens channel page.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Home LCP and carousel interaction responsiveness.
- [ ] Probe. Measure with agent-browser Web Vitals.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. Home LCP under 2.5s. Carousel transition under 300ms.

**Review gate.**

- [ ] Copy lane screenshots into `media/pr-03-review/`.
- [ ] Record a 30 to 60 second video. Save as `media/pr-03-review.mp4`.
- [ ] Post screenshots and video in chat. Stop at merge-ready. Wait for operator click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Watch feature (PR-04)

**Depends on.** PR-01 and PR-02.

**Files.**

- [ ] Create `features/stream/` playback parts and `features/chat/` shell.
- [ ] Create `app/(watch)/[channel]/page.tsx`.
- [ ] Edit shared layout for dark canvas on watch route.

**Build.**

- [ ] Channel page with Mux player for live HLS.
- [ ] Dark canvas default on watch route.
- [ ] Stream info panel with title, category, streamer, follow button.
- [ ] Chat dock shell with input and message list placeholder.
- [ ] Viewer count display.

**You see.**

- [ ] Opening a live channel plays video and shows chat dock.
- [ ] Watch route uses dark canvas.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Mux player wrapper tests. Run `bun run test`.
- [ ] Channel page component tests.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no watch. Record that fact. Gate player loads and dark canvas. Save `watch-player.png`. Pass when video element renders.
- [ ] Lane 2. Live stream playback. Save `watch-playback.png`. Pass when HLS plays.
- [ ] Lane 3. Dark canvas default. Save `watch-dark.png`. Pass when dark background.
- [ ] Lane 4. Stream info panel. Save `watch-info.png`. Pass when title and streamer show.
- [ ] Lane 5. Follow button. Save `watch-follow.png`. Pass when button renders and toggles.
- [ ] Lane 6. Viewer count. Save `watch-viewers.png`. Pass when count displays.
- [ ] Lane 7. Chat dock shell. Save `watch-chat.png`. Pass when input and list render.
- [ ] Lane 8. Offline state. Save `watch-offline.png`. Pass when offline message shows.
- [ ] Lane 9. Error state. Save `watch-error.png`. Pass when player error shows.
- [ ] Lane 10. Navigation back to browse. Save `watch-back.png`. Pass when back link works.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Player first frame time and watch page LCP.
- [ ] Probe. Measure with agent-browser.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. First frame under 3s. Watch LCP under 3s.

**Review gate.**

- [ ] Copy lane screenshots into `media/pr-04-review/`.
- [ ] Record a 30 to 60 second video. Save as `media/pr-04-review.mp4`.
- [ ] Post screenshots and video in chat. Stop at merge-ready. Wait for operator click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Stream feature (PR-05)

**Depends on.** PR-02 and PR-04.

**Files.**

- [ ] Create `features/stream/` full slice.
- [ ] Create `app/studio/go-live/page.tsx`.
- [ ] Create `app/api/mux/webhook/route.ts`.

**Build.**

- [ ] Go live form with title, category, tags.
- [ ] Mux live stream creation. Store stream key encrypted.
- [ ] RTMP URL and stream key display for OBS.
- [ ] Webhook handler for active and idle. Update stream status.
- [ ] Auto VOD archive on idle. Create VOD row from recent asset ids.
- [ ] Stream end flow.

**You see.**

- [ ] A creator can go live and viewers see the stream.
- [ ] Ending a stream creates a VOD entry.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] GoLive and EndStream use case tests. Run `bun run test`.
- [ ] Webhook handler tests with signed payloads.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no go-live. Record that fact. Gate form renders and Mux stream creates. Save `stream-golive.png`. Pass when stream key displays.
- [ ] Lane 2. Go live flow. Save `stream-live.png`. Pass when status becomes live.
- [ ] Lane 3. RTMP ingest. Save `stream-ingest.png`. Pass when OBS connects and video plays.
- [ ] Lane 4. Webhook active. Save `stream-webhook-active.png`. Pass when DB status updates to live.
- [ ] Lane 5. Webhook idle. Save `stream-webhook-idle.png`. Pass when DB status updates to ended.
- [ ] Lane 6. VOD archive. Save `stream-vod.png`. Pass when VOD row created.
- [ ] Lane 7. Stream key security. Save `stream-key.png`. Pass when key not in client bundle.
- [ ] Lane 8. Title validation. Save `stream-validate.png`. Pass when empty title rejected.
- [ ] Lane 9. Reconnect window. Save `stream-reconnect.png`. Pass when brief drop does not end stream.
- [ ] Lane 10. End stream button. Save `stream-end.png`. Pass when creator can end manually.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Functional SLA (not perf regression). Webhook processing latency and go-live round-trip.
- [ ] Probe. Measure webhook to DB update time.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. Webhook to DB update under 2s. Go-live round-trip under 5s.

**Review gate.** None. PR-05 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Chat feature (PR-06)

**Depends on.** PR-04.

**Files.**

- [ ] Create `features/chat/` full slice.
- [ ] Edit `features/stream/ui/ChatDock.tsx` integration.

**Build.**

- [ ] Supabase Realtime broadcast for messages.
- [ ] Presence for viewer count.
- [ ] Message list with emote token replacement.
- [ ] Rate limiting per user.
- [ ] Slow mode and emote-only toggles.

**You see.**

- [ ] Chat messages appear in real time across two browser windows.
- [ ] Viewer count updates on join and leave.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] SendMessage use case tests. Run `bun run test`.
- [ ] Rate limit tests.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no chat. Record that fact. Gate realtime message delivery. Save `chat-realtime.png`. Pass when message appears in second window.
- [ ] Lane 2. Send message. Save `chat-send.png`. Pass when message renders.
- [ ] Lane 3. Emote rendering. Save `chat-emote.png`. Pass when emote image renders.
- [ ] Lane 4. Presence count. Save `chat-presence.png`. Pass when viewer count updates.
- [ ] Lane 5. Rate limit. Save `chat-ratelimit.png`. Pass when spam is throttled.
- [ ] Lane 6. Slow mode. Save `chat-slow.png`. Pass when slow mode delays messages.
- [ ] Lane 7. Delete message. Save `chat-delete.png`. Pass when message removed.
- [ ] Lane 8. Reconnect. Save `chat-reconnect.png`. Pass when messages sync after drop.
- [ ] Lane 9. Empty state. Save `chat-empty.png`. Pass when empty chat shows prompt.
- [ ] Lane 10. Long message truncation. Save `chat-long.png`. Pass when long text wraps.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Message delivery latency and presence update latency.
- [ ] Probe. Measure with two browser windows.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. Message delivery under 500ms. Presence update under 1s.

**Review gate.**

- [ ] Copy lane screenshots into `media/pr-06-review/`.
- [ ] Record a 30 to 60 second video. Save as `media/pr-06-review.mp4`.
- [ ] Post screenshots and video in chat. Stop at merge-ready. Wait for operator click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Emotes feature (PR-07)

**Depends on.** PR-06.

**Files.**

- [ ] Create `features/emotes/` full slice.
- [ ] Create `app/studio/emotes/page.tsx`.
- [ ] Create `app/api/emotes/upload/route.ts`.

**Build.**

- [ ] Emote upload with validation. PNG or GIF, square, max 1MB, max 60 frames.
- [ ] Name validation regex and uniqueness per channel.
- [ ] Presigned R2 upload. Store in staging bucket.
- [ ] Moderation queue. Pending to approved or rejected.
- [ ] CDN delivery from approved bucket with immutable cache.
- [ ] Emote rendering in chat with lazy loading.

**You see.**

- [ ] A creator uploads an emote and it appears in chat after approval.
- [ ] Rejected emotes do not render.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] UploadEmote use case tests. Run `bun run test`.
- [ ] Name validation tests.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no emotes. Record that fact. Gate upload and render. Save `emote-upload.png`. Pass when emote uploads.
- [ ] Lane 2. Upload valid emote. Save `emote-valid.png`. Pass when pending state shows.
- [ ] Lane 3. Reject invalid format. Save `emote-invalid.png`. Pass when error shows.
- [ ] Lane 4. Approve emote. Save `emote-approve.png`. Pass when emote renders in chat.
- [ ] Lane 5. Reject emote. Save `emote-reject.png`. Pass when emote does not render.
- [ ] Lane 6. Duplicate name. Save `emote-dup.png`. Pass when duplicate rejected.
- [ ] Lane 7. Emote in chat. Save `emote-chat.png`. Pass when emote token renders image.
- [ ] Lane 8. CDN cache. Save `emote-cdn.png`. Pass when cache headers immutable.
- [ ] Lane 9. Delete emote. Save `emote-delete.png`. Pass when emote removed.
- [ ] Lane 10. Permission guard. Save `emote-perm.png`. Pass when non-owner cannot upload.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Upload to approved render latency and emote image load time.
- [ ] Probe. Measure upload flow and CDN fetch.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. Upload to approved under 10s. Emote image load under 300ms.

**Review gate.**

- [ ] Copy lane screenshots into `media/pr-07-review/`.
- [ ] Record a 30 to 60 second video. Save as `media/pr-07-review.mp4`.
- [ ] Post screenshots and video in chat. Stop at merge-ready. Wait for operator click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Follow and notifications (PR-08)

**Depends on.** PR-02.

**Files.**

- [ ] Create `features/follow/` full slice.
- [ ] Create `features/notifications/` full slice.

**Build.**

- [ ] Follow and unfollow with follower count.
- [ ] Following list in sidebar.
- [ ] In-app notification when followed channel goes live.
- [ ] Email or web push notification.

**You see.**

- [ ] Following a channel updates the sidebar and follower count.
- [ ] A live notification appears for followers.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] ToggleFollow use case tests. Run `bun run test`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no follow. Record that fact. Gate follow and sidebar. Save `follow-toggle.png`. Pass when follow state toggles.
- [ ] Lane 2. Follow channel. Save `follow-add.png`. Pass when follower count increments.
- [ ] Lane 3. Unfollow channel. Save `follow-remove.png`. Pass when count decrements.
- [ ] Lane 4. Sidebar following list. Save `follow-sidebar.png`. Pass when followed channels show.
- [ ] Lane 5. Idempotent follow. Save `follow-idempotent.png`. Pass when repeated follow is safe.
- [ ] Lane 6. Live notification. Save `follow-notify.png`. Pass when notification appears.
- [ ] Lane 7. Notification permission. Save `follow-perm.png`. Pass when permission prompt shows.
- [ ] Lane 8. Unauthenticated follow. Save `follow-auth.png`. Pass when redirect to sign in.
- [ ] Lane 9. Follower count accuracy. Save `follow-count.png`. Pass when count matches rows.
- [ ] Lane 10. Empty following state. Save `follow-empty.png`. Pass when empty message shows.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Functional SLA (not perf regression). Follow toggle latency and notification delivery latency.
- [ ] Probe. Measure follow API and notification delivery.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. Follow toggle under 300ms. Notification delivery under 5s.

**Review gate.** None. PR-08 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Search and categories (PR-09)

**Depends on.** PR-03.

**Files.**

- [ ] Create `features/search/` and `features/categories/`.
- [ ] Edit `app/(browse)/search/page.tsx`.
- [ ] Edit `app/(browse)/category/[slug]/page.tsx`.

**Build.**

- [ ] Search channels and categories by text.
- [ ] Category browse page with live streams.
- [ ] Search suggestions and recent searches.

**You see.**

- [ ] Typing in search shows matching channels.
- [ ] Category page lists live streams.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Search use case tests. Run `bun run test`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no search. Record that fact. Gate search returns results. Save `search-basic.png`. Pass when results render.
- [ ] Lane 2. Channel search. Save `search-channel.png`. Pass when matching channels show.
- [ ] Lane 3. Category search. Save `search-category.png`. Pass when categories show.
- [ ] Lane 4. No results. Save `search-empty.png`. Pass when empty state shows.
- [ ] Lane 5. Category page. Save `search-catpage.png`. Pass when streams list.
- [ ] Lane 6. Search suggestions. Save `search-suggest.png`. Pass when suggestions show.
- [ ] Lane 7. Recent searches. Save `search-recent.png`. Pass when recent list shows.
- [ ] Lane 8. Debounce. Save `search-debounce.png`. Pass when no excessive requests.
- [ ] Lane 9. Keyboard navigation. Save `search-keyboard.png`. Pass when arrow keys work.
- [ ] Lane 10. Clear search. Save `search-clear.png`. Pass when clear resets.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Functional SLA (not perf regression). Search response latency.
- [ ] Probe. Measure search API response.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. Search response under 300ms.

**Review gate.** None. PR-09 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Studio dashboard (PR-10)

**Depends on.** PR-05 and PR-07.

**Files.**

- [ ] Create `app/studio/layout.tsx` and `app/studio/page.tsx`.
- [ ] Create `features/studio/` slice.

**Build.**

- [ ] Creator dashboard with stream status.
- [ ] Stream key management page.
- [ ] Emote management page.
- [ ] Channel settings page.

**You see.**

- [ ] A creator can manage stream and emotes from the dashboard.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Studio component tests. Run `bun run test`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no studio. Record that fact. Gate dashboard renders. Save `studio-home.png`. Pass when dashboard loads.
- [ ] Lane 2. Stream status card. Save `studio-status.png`. Pass when status shows.
- [ ] Lane 3. Stream key page. Save `studio-key.png`. Pass when key displays masked.
- [ ] Lane 4. Emote management. Save `studio-emotes.png`. Pass when emote list shows.
- [ ] Lane 5. Channel settings. Save `studio-settings.png`. Pass when settings form renders.
- [ ] Lane 6. Save settings. Save `studio-save.png`. Pass when settings persist.
- [ ] Lane 7. Permission guard. Save `studio-perm.png`. Pass when non-creator redirected.
- [ ] Lane 8. Navigation. Save `studio-nav.png`. Pass when sidebar nav works.
- [ ] Lane 9. Empty state. Save `studio-empty.png`. Pass when empty states show.
- [ ] Lane 10. Responsive. Save `studio-responsive.png`. Pass when mobile layout works.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Dashboard load time.
- [ ] Probe. Measure dashboard LCP.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. Dashboard LCP under 2.5s.

**Review gate.** None. PR-10 is not review-gated unless it changes user-facing interaction.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Moderation (PR-11)

**Depends on.** PR-06.

**Files.**

- [ ] Create `features/moderation/` full slice.
- [ ] Edit `features/chat/` to enforce moderation.

**Build.**

- [ ] Ban and timeout users.
- [ ] Delete messages.
- [ ] Slow mode and emote-only mode.
- [ ] Mod action log.

**You see.**

- [ ] A moderator can ban a user and their messages disappear.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Mod action use case tests. Run `bun run test`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk has no moderation. Record that fact. Gate ban works. Save `mod-ban.png`. Pass when banned user cannot chat.
- [ ] Lane 2. Timeout user. Save `mod-timeout.png`. Pass when timeout expires.
- [ ] Lane 3. Delete message. Save `mod-delete.png`. Pass when message removed.
- [ ] Lane 4. Slow mode toggle. Save `mod-slow.png`. Pass when slow mode active.
- [ ] Lane 5. Emote-only toggle. Save `mod-emoteonly.png`. Pass when text blocked.
- [ ] Lane 6. Mod action log. Save `mod-log.png`. Pass when actions recorded.
- [ ] Lane 7. Permission guard. Save `mod-perm.png`. Pass when non-mod blocked.
- [ ] Lane 8. Ban list. Save `mod-banlist.png`. Pass when banned users list.
- [ ] Lane 9. Unban. Save `mod-unban.png`. Pass when user can chat again.
- [ ] Lane 10. Timeout expiry. Save `mod-expiry.png`. Pass when timeout auto-lifts.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Functional SLA (not perf regression). Moderation action latency.
- [ ] Probe. Measure ban to enforcement.
- [ ] Baseline. Record trunk value. Trunk lacks the feature. Record absolute budget.
- [ ] Rule. Moderation action under 500ms.

**Review gate.** None. PR-11 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Polish (PR-12)

**Depends on.** PR-03 and PR-04.

**Files.**

- [ ] Edit shared styles and components across features.
- [ ] Create `shared/lib/a11y.ts` helpers.

**Build.**

- [ ] Accessibility audit. AA contrast on all tokens.
- [ ] Keyboard navigation across browse and watch.
- [ ] Reduced motion support.
- [ ] Responsive polish.
- [ ] Perf tuning. Code splitting, lazy loading.

**You see.**

- [ ] Lighthouse accessibility score over 90.
- [ ] No contrast failures.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] A11y unit tests. Run `bun run test`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, each in its own git worktree.

- [ ] Lane 1. Regression lane against trunk. Trunk lacks polish. Record that fact. Gate a11y score. Save `polish-a11y.png`. Pass when score over 90.
- [ ] Lane 2. Contrast check. Save `polish-contrast.png`. Pass when no failures.
- [ ] Lane 3. Keyboard nav. Save `polish-keyboard.png`. Pass when tab order works.
- [ ] Lane 4. Reduced motion. Save `polish-motion.png`. Pass when animations disable.
- [ ] Lane 5. Responsive browse. Save `polish-responsive-browse.png`. Pass when mobile layout works.
- [ ] Lane 6. Responsive watch. Save `polish-responsive-watch.png`. Pass when mobile layout works.
- [ ] Lane 7. Focus indicators. Save `polish-focus.png`. Pass when focus rings visible.
- [ ] Lane 8. Screen reader labels. Save `polish-sr.png`. Pass when aria labels present.
- [ ] Lane 9. Color blind check. Save `polish-cb.png`. Pass when info not color-only.
- [ ] Lane 10. Perf budget. Save `polish-perf.png`. Pass when budgets met.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Home and watch LCP, CLS, INP.
- [ ] Probe. Measure with agent-browser Web Vitals.
- [ ] Baseline. Record trunk values first.
- [ ] Rule. LCP under 2.5s. CLS under 0.1. INP under 200ms.

**Review gate.** None. PR-12 is not review-gated unless it changes user-facing interaction.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Append to the base-branch stack.

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution playbook names.

## Appendix A. Prototype evidence

- Prototype orange ladder on a Twitch-like home. Branch and SHA recorded when run.
- Prototype Mux live stream creation and webhook round-trip.
- Prototype Supabase Realtime chat with two windows.
- Prototype emote upload to R2 and CDN render.
- Unproven. Final contrast of orange on dark canvas pending real render.

## Appendix B. Alternatives rejected

- Playwright for E2E. Rejected in favor of agent-browser plus Lightpanda for speed.
- Horizontal layers. Rejected in favor of vertical slices for agent navigation.
- Self-hosted streaming. Rejected in favor of Mux for MVP speed.
- Socket.IO for chat. Rejected in favor of Supabase Realtime for managed scale.
- Agent-ready harness. Rejected in favor of biome plus custom boundary script.

## Appendix C. Risks

- Lightpanda may lack media APIs. Mitigation. Use Chromium for watch and stream lanes.
- Mux costs scale with minutes. Mitigation. Budget alerts and free tier usage.
- Orange contrast on white. Mitigation. Use darker orange for text and links.
- Supabase realtime limits on large streams. Mitigation. Presence aggregation and plan upgrade.
- Emote moderation bottleneck. Mitigation. Auto-approve safe formats and manual review queue.

## Appendix D. Links and reading list

- Mux live streaming. https://www.mux.com/live
- Mux build your own live app. https://www.mux.com/articles/how-to-build-your-own-live-streaming-app-with-mux-video
- Supabase Realtime. https://supabase.com/docs/guides/realtime
- Supabase limits. https://supabase.com/docs/guides/realtime/limits
- agent-browser. https://github.com/vercel-labs/agent-browser
- Lightpanda. https://github.com/lightpanda-io/browser
- Twitch Beyond Purple. https://blog.twitch.tv/en/2019/12/03/beyond-purple/
- Twitch DESIGN.md. https://www.shadcn.io/design/twitch/raw
- Crunchyroll DESIGN.md. https://www.shadcn.io/design/crunchyroll
- Emote guidelines. https://help.twitch.tv/s/article/emote-guidelines
- R2 presigned URLs. https://developers.cloudflare.com/r2/api/s3/presigned-urls/