# Contributing to nhl-mcp

Thanks for your interest in contributing. This is a small, focused project — contributions that keep it that way are most welcome.

---

## The most important thing to understand first

This project wraps `api-web.nhle.com`, which is **not an official, documented API**. It is reverse-engineered from network traffic on `nhl.com`. This has two practical consequences:

1. **Response shapes can change without notice.** The NHL has no obligation to maintain backwards compatibility.
2. **Every new endpoint or field you add needs a real captured fixture** to back it up. PRs without fixtures are hard to review and will likely break in edge cases.

Please keep this in mind before opening a PR that adds new endpoints.

---

## How to contribute

### Reporting bugs

Open an issue and include:

- The tool name and input you used
- The error or unexpected output you got
- The date and approximate time (NHL API behavior varies by game state and season phase)
- Whether it's reproducible or intermittent

If the bug is "this endpoint returns a different shape during playoffs / off-season", that's expected and worth documenting, not necessarily fixing.

### Adding a new tool or endpoint

1. **Capture a real fixture first.** Use your browser's devtools (Network tab) on `nhl.com` and copy the raw JSON response. Save it to `tests/fixtures/<endpoint-name>.json`.

2. **Add types to `src/api/types.ts`.** All new fields must be optional (`| undefined`) unless you have multiple fixtures confirming the field is always present, including during off-season and playoffs.

3. **Add the client function to `src/api/client.ts`.** One function per logical endpoint.

4. **Create the tool handler in `src/tools/`.** Follow the existing pattern: Zod schema + `safeToolCall` wrapper + shaped output. Never return raw API responses directly — always map to a clean, minimal shape.

5. **Register the tool in `src/index.ts`.** Add to the `TOOLS` array and the `switch` in the `CallToolRequestSchema` handler.

6. **Write a test.** Mock the API client and test at minimum: happy path, empty result, and API error. See `tests/scores.test.ts` for the pattern.

7. **Run the full check before opening a PR:**
   ```bash
   npm run typecheck
   npm run build
   npm test
   ```

### Improving existing tools

If you're adjusting the output shape of an existing tool, be aware that this is a **breaking change** for anyone whose prompts depend on specific field names. Please note it clearly in your PR description.

### Updating types

If you discover a field that's missing or incorrectly typed:

- Add it as optional unless you have strong evidence it's always present
- Include the fixture that informed the change in your PR description (paste the relevant JSON snippet)
- Do not remove existing optional fields even if you haven't seen them — other people may rely on them

---

## What we're not looking for

- **A passthrough proxy.** The goal is a small, well-typed surface, not one tool per NHL API endpoint.
- **Caching layers.** Out of scope for this package; users can add a proxy.
- **HTTP/SSE transport.** Stdio-only for now. Open an issue to discuss before building this.
- **Breaking changes to existing tool names or input schemas.** MCP tool names are user-facing; renaming them breaks prompts silently.

---

## Code style

- TypeScript strict mode, no `any`
- All optional fields use `| undefined`, not `?` on the interface key, so access is forced to be defensive
- Tool handlers never throw — always use `safeToolCall`
- Keep tool descriptions accurate: LLMs use them to decide when and how to call the tool

---

## Community reference

The community-maintained NHL API reference at [Zmalski/NHL-API-Reference](https://github.com/Zmalski/NHL-API-Reference) is a useful cross-reference when working out endpoint shapes. Do not copy code from it, but feel free to validate your types against it.

---

## Cutting a release (maintainers only)

Bump the version in `package.json` as part of your PR:

```bash
npm version patch --no-git-tag-version
# or: minor / major
```

Open the PR, get it reviewed, and merge. When the PR lands on `main`, the `Publish` GitHub Actions workflow runs automatically — it typechecks, builds, tests, and publishes to npm. No manual tagging or pushing required.

If the version in `package.json` was not bumped before merging, the publish step will fail with a "version already exists" error from npm. Fix it by opening a new PR with the version bump.

**Prerequisite:** The `nhl-mcp` package on npmjs.com must have this GitHub repository registered as a Trusted Publisher (package → Settings → Trusted Publishers → Add). No secret or token is needed — the workflow authenticates via GitHub Actions OIDC.
