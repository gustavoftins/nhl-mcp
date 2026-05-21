# CD: Automated npm Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions workflow that publishes the `nhl-mcp` package to the public npm registry whenever a `v*` tag is pushed.

**Architecture:** A single new workflow file (`.github/workflows/publish.yml`) runs the full check suite (typecheck → build → test) on Node 20, then calls `npm publish`. Version management is done locally via `npm version`; the resulting git tag is what triggers the workflow. One secret (`NPM_TOKEN`) must be added to the GitHub repository before the workflow can publish.

**Tech Stack:** GitHub Actions (`actions/checkout@v4`, `actions/setup-node@v4`), npm, TypeScript.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `.github/workflows/publish.yml` | CD workflow — triggered by `v*` tag push |
| Modify | `CONTRIBUTING.md` | Add "Cutting a release" section for maintainers |

---

### Task 1: Create the publish workflow

**Files:**
- Create: `.github/workflows/publish.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/publish.yml` with this exact content:

```yaml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

The `registry-url` on `setup-node` is not optional — it writes a `.npmrc` that tells npm to read auth from `NODE_AUTH_TOKEN`. Without it, `npm publish` ignores the env var and fails with an auth error.

- [ ] **Step 2: Validate the YAML syntax**

Run:
```bash
node -e "
const fs = require('fs');
const yaml = require('js-yaml');
yaml.load(fs.readFileSync('.github/workflows/publish.yml', 'utf8'));
console.log('YAML valid');
"
```

If `js-yaml` isn't available, use Python instead:
```bash
python3 -c "
import yaml, sys
yaml.safe_load(open('.github/workflows/publish.yml'))
print('YAML valid')
"
```

Expected output: `YAML valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/publish.yml
git commit -m "ci: add npm publish workflow on v* tag push"
```

---

### Task 2: Document the release process in CONTRIBUTING.md

**Files:**
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Add a "Cutting a release" section**

Append the following to the end of `CONTRIBUTING.md`:

```markdown

---

## Cutting a release (maintainers only)

Before releasing, make sure the full check suite passes locally:

```bash
npm run typecheck
npm run build
npm test
```

Then bump the version, tag, and push:

```bash
# Replace 'patch' with 'minor' or 'major' as appropriate
npm version patch
git push --follow-tags
```

`npm version` updates `package.json`, commits the change, and creates a git tag (e.g. `v0.2.0`). Pushing the tag triggers the `Publish` GitHub Actions workflow, which re-runs the full check suite and then publishes to npm.

**Prerequisite:** The repository must have an `NPM_TOKEN` secret configured (GitHub repo → Settings → Secrets and variables → Actions). Generate the token at npmjs.com → Account → Access Tokens → Generate New Token → type: **Automation**.
```

- [ ] **Step 2: Verify the file looks right**

Run:
```bash
tail -30 CONTRIBUTING.md
```

Expected: the "Cutting a release" section appears at the bottom with correct formatting.

- [ ] **Step 3: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add release process to CONTRIBUTING"
```

---

### Task 3: Add the NPM_TOKEN secret (manual step — cannot be automated)

This step is performed in the GitHub web UI, not the terminal.

- [ ] **Step 1: Generate an npm Automation token**

1. Go to [npmjs.com](https://www.npmjs.com) → click your avatar → **Access Tokens**
2. Click **Generate New Token** → select type **Automation**
3. Copy the token (it is shown only once)

- [ ] **Step 2: Add the secret to GitHub**

1. Open the repository on GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: paste the token from Step 1
5. Click **Add secret**

- [ ] **Step 3: Verify the secret appears in the list**

The secrets list should show `NPM_TOKEN` (value is masked). No terminal step needed.

---

### Task 4: Smoke test — trigger the workflow

- [ ] **Step 1: Confirm the package name is available (first publish only)**

Run:
```bash
npm info nhl-mcp
```

If this returns package info, the name is taken on npm. If it errors with `404`, the name is free and the first publish will claim it.

- [ ] **Step 2: Do a dry-run publish to verify the package contents**

Run:
```bash
npm pack --dry-run
```

Expected: a list of files that will be included in the published package. Confirm `dist/` files and `README.md` are present. Confirm `src/`, `tests/`, `node_modules/` are **not** present (they are excluded by the `files` field in `package.json`).

- [ ] **Step 3: Push a tag to trigger the workflow**

```bash
# This bumps package.json to 0.1.1 (or whatever version is next), commits, and tags
npm version patch
git push --follow-tags
```

- [ ] **Step 4: Watch the workflow run**

Open the repository on GitHub → **Actions** tab → click the **Publish** workflow run. Verify all steps pass, including the final "Publish to npm" step.

- [ ] **Step 5: Confirm the package is live on npm**

```bash
npm info nhl-mcp version
```

Expected: the version you just published (e.g. `0.1.1`).
