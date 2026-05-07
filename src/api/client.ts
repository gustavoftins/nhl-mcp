import type {
  ScheduleResponse,
  ScoreResponse,
  StandingsResponse,
  RosterResponse,
  PlayerLanding,
  PlayerSearchResponse,
  BoxscoreResponse,
} from "./types.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = "https://api-web.nhle.com";
const API_VERSION = "v1";

const DEFAULT_HEADERS: HeadersInit = {
  "User-Agent": "nhl-mcp/0.1.0-alpha (https://github.com/your-org/nhl-mcp)",
  Accept: "application/json",
};

// ─── Error types ──────────────────────────────────────────────────────────────

export class NhlApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    message: string,
  ) {
    super(`NHL API ${status} on ${path}: ${message}`);
    this.name = "NhlApiError";
  }
}

export class NhlNotFoundError extends NhlApiError {
  constructor(path: string) {
    super(404, path, "Resource not found");
    this.name = "NhlNotFoundError";
  }
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const url = `${BASE_URL}/${API_VERSION}/${path}`;

  let response: Response;
  try {
    response = await fetch(url, { headers: DEFAULT_HEADERS });
  } catch (err) {
    throw new NhlApiError(0, path, `Network error: ${String(err)}`);
  }

  if (response.status === 404) throw new NhlNotFoundError(path);

  if (!response.ok) {
    const body = await response.text().catch(() => "(unreadable body)");
    throw new NhlApiError(response.status, path, body);
  }

  return response.json() as Promise<T>;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * Weekly schedule for a given team, anchored to a date.
 * Date format: "YYYY-MM-DD". Omit for current week.
 */
export async function getSchedule(
  teamAbbrev: string,
  date?: string,
): Promise<ScheduleResponse> {
  const path = date
    ? `club-schedule-season/${teamAbbrev}/${date}`
    : `club-schedule/${teamAbbrev}/week/now`;
  return get<ScheduleResponse>(path);
}

/**
 * League-wide schedule for a specific date.
 */
export async function getScheduleByDate(date: string): Promise<ScheduleResponse> {
  return get<ScheduleResponse>(`schedule/${date}`);
}

// ─── Scores ───────────────────────────────────────────────────────────────────

/**
 * Scores for a specific date ("YYYY-MM-DD") or "now" for today.
 */
export async function getScores(date: string = "now"): Promise<ScoreResponse> {
  return get<ScoreResponse>(`score/${date}`);
}

// ─── Standings ────────────────────────────────────────────────────────────────

/**
 * Current league standings. Pass a "YYYY-MM-DD" date for historical standings.
 */
export async function getStandings(date?: string): Promise<StandingsResponse> {
  const path = date ? `standings/${date}` : "standings/now";
  return get<StandingsResponse>(path);
}

// ─── Teams ────────────────────────────────────────────────────────────────────

/**
 * Full roster for a team and season (e.g., "20242025").
 * Omit season for current season.
 */
export async function getRoster(
  teamAbbrev: string,
  season?: string,
): Promise<RosterResponse> {
  const path = season
    ? `roster/${teamAbbrev}/${season}`
    : `roster/${teamAbbrev}/current`;
  return get<RosterResponse>(path);
}

// ─── Players ──────────────────────────────────────────────────────────────────

/**
 * Full player profile, stats, and last 5 games.
 */
export async function getPlayerLanding(playerId: number): Promise<PlayerLanding> {
  return get<PlayerLanding>(`player/${playerId}/landing`);
}

/**
 * Search for a player by name fragment (minimum 3 characters recommended).
 */
export async function searchPlayer(query: string): Promise<PlayerSearchResponse> {
  const encoded = encodeURIComponent(query);
  return get<PlayerSearchResponse>(`player/search?name=${encoded}&culture=en-us&limit=10`);
}

// ─── Game detail ──────────────────────────────────────────────────────────────

/**
 * Full boxscore for a game ID (8-digit number, e.g. 2024020512).
 */
export async function getBoxscore(gameId: number): Promise<BoxscoreResponse> {
  return get<BoxscoreResponse>(`gamecenter/${gameId}/boxscore`);
}

/**
 * Play-by-play data for a game. Returns raw unknown because the shape
 * is highly variable — consumers should handle it as needed.
 */
export async function getPlayByPlay(gameId: number): Promise<unknown> {
  return get<unknown>(`gamecenter/${gameId}/play-by-play`);
}
