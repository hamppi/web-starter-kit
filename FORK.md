# Fork notes — hamppi/web-starter-kit

| | |
|---|---|
| Local clone | `D:\HTML5Games\vibegameengine_webstarter_kit` |
| `origin` | https://github.com/hamppi/web-starter-kit (the user's fork; all our changes go here) |
| `upstream` | https://github.com/vibegameengine/web-starter-kit (public original; read-only for us) |
| Default branch | `main` (both) |
| Set up | 2026-10-10 at upstream `846b119` (2026-09-28, "every lab starts under the demo scene's sky, haze and light") |

## Upstream sync policy
Goal: own the fork, take only upstream changes that help. Never auto-merge.
1. `pwsh -File ~/.claude/skills/web-starter-kit/scripts/check-updates.ps1` fetches `upstream` and lists commits and files not yet reviewed.
2. Triage each upstream commit: **take** (bug fix, optimizer, skill, doc that helps), **skip** (does not fit our changes), **later**.
3. Take everything: branch `sync/upstream-YYYY-MM-DD`, `git merge upstream/main`, resolve conflicts keeping our fork changes, run `npm run lint && npm run test && npm run build`, then merge into `main`.
   Take only some: `git cherry-pick <sha>` on that branch instead.
4. Update the table below, commit, push `origin`. Never force-push; never discard fork work.

## Triage log
`Reviewed through` is the last upstream SHA we looked at. A SHA we skipped on purpose goes in `Skipped` with the reason, so it is not re-offered.

| Reviewed through | Date | Result |
|---|---|---|
| `846b119` | 2026-10-10 | Initial fork, identical to upstream |

Skipped upstream commits: none yet.

## Fork changes (keep short; one line each, newest first)
- 2026-10-10: `scripts/link-agent-skills.ts` falls back to a mirrored copy where links are impossible (D: is exFAT; junctions fail with EISDIR). After editing `agents/skills/`, re-run `node scripts/link-agent-skills.ts`. Expect a small merge conflict here if upstream edits this script.
- 2026-10-10: added `CLAUDE.md` (precedence rules, token discipline), `FORK.md`, enabled `.claude/settings.json` hooks (destructive-git block + clean-code guard).
