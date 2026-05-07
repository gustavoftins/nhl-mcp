import { z } from "zod";
import { getScores } from "../api/client.js";
import { safeToolCall } from "../utils/errors.js";

export const scoresSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be "YYYY-MM-DD"')
    .optional()
    .describe('Date to fetch scores for, e.g. "2024-11-15". Omit for today.'),
});

export type ScoresInput = z.infer<typeof scoresSchema>;

export async function handleGetScores(input: ScoresInput) {
  return safeToolCall(async () => {
    const data = await getScores(input.date ?? "now");

    if (!data.games || data.games.length === 0) {
      return { date: data.date, message: "No games scheduled for this date.", games: [] };
    }

    return {
      date: data.date,
      games: data.games.map((g) => ({
        gameId: g.id,
        gameState: g.gameState,
        startTimeUTC: g.startTimeUTC,
        venue: g.venue?.default,
        away: {
          team: g.awayTeam.abbrev ?? g.awayTeam.name?.default,
          score: g.awayTeam.score,
          sog: g.awayTeam.sog,
        },
        home: {
          team: g.homeTeam.abbrev ?? g.homeTeam.name?.default,
          score: g.homeTeam.score,
          sog: g.homeTeam.sog,
        },
        period: g.periodDescriptor
          ? {
              number: g.periodDescriptor.number,
              type: g.periodDescriptor.periodType,
            }
          : undefined,
        clock: g.clock
          ? {
              timeRemaining: g.clock.timeRemaining,
              inIntermission: g.clock.inIntermission,
            }
          : undefined,
      })),
    };
  });
}
