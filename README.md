# nhl-mcp

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that wraps the unofficial NHL API (`api-web.nhle.com`), giving AI assistants like Claude real-time access to NHL scores, schedules, standings, rosters, and player stats.

> **Note:** This project targets the undocumented `api-web.nhle.com` API reverse-engineered from `nhl.com`. It may break without notice if the NHL changes their API. Community reverse-engineering reference: [Zmalski/NHL-API-Reference](https://github.com/Zmalski/NHL-API-Reference).

---

## Quick start

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nhl": {
      "command": "npx",
      "args": ["nhl-mcp"]
    }
  }
}
```

Restart Claude Desktop. You can now ask things like:

- *"What are tonight's NHL scores?"*
- *"Show me the Eastern Conference standings."*
- *"How is Auston Matthews performing this season?"*
- *"What does the Maple Leafs roster look like?"*

### Other MCP hosts (Cursor, etc.)

Use the same `npx nhl-mcp` command. Refer to your host's MCP configuration docs.

---

## Available tools

| Tool | Description |
|---|---|
| `get_scores` | Live and final scores for a date (default: today) |
| `get_schedule` | Team or league-wide schedule |
| `get_standings` | League standings, filterable by conference/division |
| `get_team_info` | Full roster for a team |
| `get_player_info` | Player bio and stats by numeric ID |
| `search_player` | Find a player by name, returns their ID |
| `get_game_detail` | Boxscore and optional play-by-play for a game |

---

## Development

```bash
git clone https://github.com/your-org/nhl-mcp
cd nhl-mcp
npm install
npm run build

# Run with the MCP inspector for interactive testing
npm run inspector
```

### Running tests

```bash
npm test
```

### Project structure

```
src/
├── index.ts          # MCP server entrypoint and tool registry
├── api/
│   ├── client.ts     # Typed fetch wrapper for api-web.nhle.com
│   └── types.ts      # Hand-crafted response types
├── tools/            # One handler file per domain
│   ├── scores.ts
│   ├── schedule.ts
│   ├── standings.ts
│   ├── teams.ts
│   ├── players.ts
│   └── game.ts
└── utils/
    └── errors.ts     # Safe tool call wrapper
```

---

## Known limitations

- **Undocumented API:** `api-web.nhle.com` has no official docs and can change at any time.
- **Geo-blocking:** Some endpoints may behave differently outside North America.
- **Off-season data:** Schedule and standings shapes differ during the off-season. If you hit issues, open an issue with the date range.
- **Play-by-play:** The play-by-play response shape is highly variable and returned as raw JSON. Parse with care.

---

## Contributing

PRs are welcome. Before submitting:

1. Run `npm run typecheck` — zero errors required.
2. Add or update tests in `tests/` for any new tool behavior.
3. If you've discovered new API fields, add them to `src/api/types.ts` as optional (`| undefined`).

---

## License

MIT
