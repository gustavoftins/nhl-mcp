import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import type { ScoreResponse } from "../src/api/types.js";

// jest.unstable_mockModule is the correct ESM-native API.
// The mock function is captured in a closure so beforeEach can reconfigure it.
const mockGetScores = jest.fn<() => Promise<ScoreResponse>>();

jest.unstable_mockModule("../src/api/client.js", () => ({
  getScores: mockGetScores,
  // errors.ts imports these for instanceof checks — provide stubs so the module links correctly.
  NhlApiError: class NhlApiError extends Error {},
  NhlNotFoundError: class NhlNotFoundError extends Error {},
}));

// Dynamic imports must come after unstable_mockModule so Jest intercepts them.
const { handleGetScores } = await import("../src/tools/scores.js");

const MOCK_SCORES: ScoreResponse = {
  date: "2024-11-15",
  games: [
    {
      id: 2024020234,
      season: 20242025,
      gameType: 2,
      gameDate: "2024-11-15",
      startTimeUTC: "2024-11-15T23:00:00Z",
      easternUTCOffset: "-05:00",
      venueUTCOffset: "-05:00",
      gameState: "FINAL",
      gameScheduleState: "OK",
      awayTeam: {
        id: 10,
        name: { default: "Toronto Maple Leafs" },
        abbrev: "TOR",
        score: 4,
        sog: 31,
      },
      homeTeam: {
        id: 6,
        name: { default: "Boston Bruins" },
        abbrev: "BOS",
        score: 2,
        sog: 28,
      },
      periodDescriptor: { number: 3, periodType: "REG" },
      venue: { default: "TD Garden" },
    },
  ],
};

describe("handleGetScores", () => {
  beforeEach(() => {
    mockGetScores.mockResolvedValue(MOCK_SCORES);
  });

  it("returns structured scores for a date", async () => {
    const result = await handleGetScores({ date: "2024-11-15" });
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.date).toBe("2024-11-15");
    expect(parsed.games).toHaveLength(1);

    const game = parsed.games[0];
    expect(game.away.team).toBe("TOR");
    expect(game.away.score).toBe(4);
    expect(game.home.team).toBe("BOS");
    expect(game.gameState).toBe("FINAL");
  });

  it("returns a no-games message when the list is empty", async () => {
    mockGetScores.mockResolvedValue({ date: "2024-07-01", games: [] });

    const result = await handleGetScores({ date: "2024-07-01" });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.message).toMatch(/no games/i);
    expect(parsed.games).toHaveLength(0);
  });

  it("returns a structured error when the API throws", async () => {
    mockGetScores.mockRejectedValue(new Error("network timeout"));

    const result = await handleGetScores({});
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("unexpected_error");
  });
});
