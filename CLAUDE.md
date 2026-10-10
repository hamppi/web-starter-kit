@AGENTS.md

# Web Starter Kit — fork-local overrides (this file is fork-only; upstream has no CLAUDE.md)

This repo is `hamppi/web-starter-kit`, a fork of `vibegameengine/web-starter-kit`. Fork workflow, remotes and the
upstream-sync policy are in [FORK.md](./FORK.md). Every game started from this kit uses it fully: skills in
`agents/skills/` (surfaced as `.claude/skills/` after `npm ci`), roles in `agents/`, build-time optimizers, `docs/`.

## Precedence over the upstream rules above
- **Headless/headed (conflict, user's global rule wins):** upstream rule 1 bans headless and wants a headed browser. The user's
  global rule forbids anything that can take the desktop cursor or focus. So: never run a headed browser, PIE or
  window-grabbing test without the user's explicit OK for that run; say plainly that a headless or static check is not visual
  proof. Do not claim "looks right" without a frame.
- **Never ask what you can decide** (upstream rule 4) stays, but ask at the END of the task, not mid-task.
- Commit on a branch, never straight to `main`; `main` of the fork is the integration branch. Push at the end of finished work.
- Fork changes (this repo's own code, docs, skills) are allowed and expected. Keep them in separate commits from upstream merges.

## Token discipline
- Do not load the whole skill set. Pick the role first (`agents/AGENTS.md`), then only the skills the task names.
- Global skills `threejs-game` / `threejs-perf` describe a vanilla-Three.js event-driven layout; this kit is React Three Fiber +
  FSD/ECS, so use the kit's `threejs-*`, `fsd-ecs-architecture` and `optimization` first. Take only the perf numbers rules from
  the global ones (measure `renderer.info` before/after, report numbers).
- Web portal rules (Playgama/Yandex/Poki moderation, input lock) still apply to games built here: global skill `web-portal-platforms`.

## Updates
When the user says "Web Starter Kit" and asks about status, updates or starting a project from it, run
`pwsh -File ~/.claude/skills/web-starter-kit/scripts/check-updates.ps1` and follow the global skill `web-starter-kit`.
