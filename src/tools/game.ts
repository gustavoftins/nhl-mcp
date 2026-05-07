import { z } from "zod";
import { getBoxscore, getPlayByPlay } from "../api/client.js";
import { safeToolCall } from "../utils/errors.js";

export const gameDetailSchema = z.object({
  gameId: z
    .number()
    .int()
    .positive()
    .describe("8-digit NHL game ID, e.g. 2024020512. Find IDs via get_scores or get_schedule."),
  includePlayByPlay: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to include full play-by-play data. Defaults to false (boxscore only)."),
});

export type GameDetailInput = z.infer<typeof gameDetailSchema>;

export async function handleGetGameDetail(input: GameDetailInput) {
  return safeToolCall(async () => {
    const boxscore = await getBoxscore(input.gameId);

    const result: Record<string, unknown> = {
      gameId: boxscore.id,
      gameState: boxscore.gameState,
      gameDate: boxscore.gameDate,
      startTimeUTC: boxscore.startTimeUTC,
      venue: boxscore.venue?.default,
      period: boxscore.periodDescriptor
        ? {
            number: boxscore.periodDescriptor.number,
            type: boxscore.periodDescriptor.periodType,
          }
        : undefined,
      clock: boxscore.clock
        ? {
            timeRemaining: boxscore.clock.timeRemaining,
            inIntermission: boxscore.clock.inIntermission,
          }
        : undefined,
      away: {
        team: boxscore.awayTeam.abbrev ?? boxscore.awayTeam.name?.default,
        score: boxscore.awayTeam.score,
        sog: boxscore.awayTeam.sog,
      },
      home: {
        team: boxscore.homeTeam.abbrev ?? boxscore.homeTeam.name?.default,
        score: boxscore.homeTeam.score,
        sog: boxscore.homeTeam.sog,
      },
      teamStats: boxscore.teamGameStats,
    };

    if (input.includePlayByPlay) {
      result.playByPlay = await getPlayByPlay(input.gameId);
    }

    return result;
  });
}
