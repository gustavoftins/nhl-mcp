import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// We mock the API client so tests don't make real HTTP requests
jest.mock("../src/api/client.js");

import { handleGetScores } from "../src/tools/scores.js";
import * as client from "../src/api/client.js";

const MOCK_SCORES = {
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
      gameState: "FINAL" as const,
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
      periodDescriptor: { number: 3, periodType: "REG" as const },
      venue: { default: "TD Garden" },
    },
  ],
};

describe("handleGetScores", () => {
  beforeEach(() => {
    (client.getScores as jest.MockedFunction<typeof client.getScores>).mockResolvedValue(
      MOCK_SCORES,
    );
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
    (client.getScores as jest.MockedFunction<typeof client.getScores>).mockResolvedValue({
      date: "2024-07-01",
      games: [],
    });

    const result = await handleGetScores({ date: "2024-07-01" });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.message).toMatch(/no games/i);
    expect(parsed.games).toHaveLength(0);
  });

  it("returns a structured error when the API throws", async () => {
    (client.getScores as jest.MockedFunction<typeof client.getScores>).mockRejectedValue(
      new Error("network timeout"),
    );

    const result = await handleGetScores({});
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("unexpected_error");
  });
});
