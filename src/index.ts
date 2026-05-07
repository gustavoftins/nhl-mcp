#!/usr/bin/env node

/**
 * nhl-mcp — MCP server for the unofficial NHL API (api-web.nhle.com)
 *
 * Usage (Claude Desktop):
 *   {
 *     "mcpServers": {
 *       "nhl": { "command": "npx", "args": ["nhl-mcp"] }
 *     }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

// Tools
import { scoresSchema, handleGetScores } from "./tools/scores.js";
import { scheduleSchema, handleGetSchedule } from "./tools/schedule.js";
import { standingsSchema, handleGetStandings } from "./tools/standings.js";
import { teamInfoSchema, handleGetTeamInfo } from "./tools/teams.js";
import {
  playerInfoSchema,
  playerSearchSchema,
  handleGetPlayerInfo,
  handleSearchPlayer,
} from "./tools/players.js";
import { gameDetailSchema, handleGetGameDetail } from "./tools/game.js";

// ─── Tool registry ────────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    name: "get_scores",
    description:
      "Get NHL game scores for a specific date. Returns live scores with period/clock info, " +
      "or final scores. Omit date for today's games.",
    inputSchema: zodToJsonSchema(scoresSchema) as Tool["inputSchema"],
  },
  {
    name: "get_schedule",
    description:
      "Get the NHL game schedule. Provide a teamAbbrev (e.g. 'TOR') for a team's week schedule, " +
      "or just a date for the league-wide schedule on that day.",
    inputSchema: zodToJsonSchema(scheduleSchema) as Tool["inputSchema"],
  },
  {
    name: "get_standings",
    description:
      "Get current NHL standings. Can filter by conference ('E' or 'W') or division abbreviation. " +
      "Pass a date for historical standings.",
    inputSchema: zodToJsonSchema(standingsSchema) as Tool["inputSchema"],
  },
  {
    name: "get_team_info",
    description:
      "Get a team's current roster including forwards, defensemen, and goalies. " +
      "Requires the 3-letter team abbreviation (e.g. 'BOS', 'NYR', 'VGK').",
    inputSchema: zodToJsonSchema(teamInfoSchema) as Tool["inputSchema"],
  },
  {
    name: "get_player_info",
    description:
      "Get detailed info and stats for a player by their numeric NHL player ID. " +
      "Use search_player to look up the ID by name first.",
    inputSchema: zodToJsonSchema(playerInfoSchema) as Tool["inputSchema"],
  },
  {
    name: "search_player",
    description:
      "Search for NHL players by name. Returns player IDs, teams, and positions. " +
      "Use the returned playerId with get_player_info for full stats.",
    inputSchema: zodToJsonSchema(playerSearchSchema) as Tool["inputSchema"],
  },
  {
    name: "get_game_detail",
    description:
      "Get boxscore and team stats for a specific game. Use get_scores or get_schedule " +
      "to find gameId values. Set includePlayByPlay to true for full play-by-play data.",
    inputSchema: zodToJsonSchema(gameDetailSchema) as Tool["inputSchema"],
  },
];

// ─── Server setup ─────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: "nhl-mcp",
    version: "0.1.0-alpha",
  },
  {
    capabilities: { tools: {} },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_scores":
      return handleGetScores(scoresSchema.parse(args ?? {}));

    case "get_schedule":
      return handleGetSchedule(scheduleSchema.parse(args ?? {}));

    case "get_standings":
      return handleGetStandings(standingsSchema.parse(args ?? {}));

    case "get_team_info":
      return handleGetTeamInfo(teamInfoSchema.parse(args));

    case "get_player_info":
      return handleGetPlayerInfo(playerInfoSchema.parse(args));

    case "search_player":
      return handleSearchPlayer(playerSearchSchema.parse(args));

    case "get_game_detail":
      return handleGetGameDetail(gameDetailSchema.parse(args));

    default:
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "unknown_tool", message: `No tool named "${name}"` }),
          },
        ],
        isError: true,
      };
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
// Server is now running on stdio — do not write to stdout after this point
