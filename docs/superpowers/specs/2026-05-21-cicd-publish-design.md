# CD: Automated npm Publish on Git Tag

**Date:** 2026-05-21  
**Status:** Approved

## Context

The project already has a CI workflow (`.github/workflows/ci.yml`) that runs typecheck, build, and tests across Node 18/20/22 on every push and PR to `main`. This spec adds the CD half: automated publishing to the public npm registry (`nhl-mcp`) when a version tag is pushed.

## Trigger

`push: tags: ['v*']` — any tag matching `v*` (e.g. `v0.2.0`, `v1.0.0`) fires the publish workflow.

## Workflow Design

**File:** `.github/workflows/publish.yml`

Single job, Node 20 (LTS), no matrix — cross-version compatibility is already validated by `ci.yml`; the publish job only needs one stable runtime.

Steps:
1. `actions/checkout@v4`
2. `actions/setup-node@v4` with `node-version: 20` and `registry-url: 'https://registry.npmjs.org'` — this is required to wire `.npmrc` so `NODE_AUTH_TOKEN` is picked up by `npm publish`
3. `npm ci`
4. `npm run typecheck`
5. `npm run build`
6. `npm test`
7. `npm publish --access public` with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`

Steps 4–6 (the full check suite) run inline before publish. This guards against publishing a build that somehow fails on the exact tagged commit even if CI was green on an earlier one.

## Secrets

One secret required in the GitHub repository settings:

| Secret | How to obtain |
|--------|---------------|
| `NPM_TOKEN` | npmjs.com → Account → Access Tokens → Generate New Token (Automation type) |

## Developer Release Workflow

```bash
# Bump version (patch / minor / major), commits package.json, creates git tag
npm version patch

# Push commit + tag together
git push --follow-tags
```

`npm version` keeps `package.json` and the git tag in sync atomically. The workflow fires on tag push, runs the full check suite, then publishes.

## Out of Scope

- Changelog generation
- GitHub Release creation
- Prerelease / dist-tag support (`next`, `beta`)
- OIDC-based publishing (no NPM_TOKEN)
