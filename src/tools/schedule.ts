import { z } from "zod";
import { getScheduleByDate, getSchedule } from "../api/client.js";
import { safeToolCall } from "../utils/errors.js";

export const scheduleSchema = z.object({
  teamAbbrev: z
    .string()
    .length(3)
    .toUpperCase()
    .optional()
    .describe('Three-letter team abbreviation, e.g. "TOR", "BOS". Omit for league-wide schedule.'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be "YYYY-MM-DD"')
    .optional()
    .describe('Date anchor for the schedule. Omit for current week.'),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;

export async function handleGetSchedule(input: ScheduleInput) {
  return safeToolCall(async () => {
    if (input.teamAbbrev) {
      const data = await getSchedule(input.teamAbbrev, input.date);
      const games = (data.gameWeek ?? []).flatMap((day) =>
        day.games.map((g) => ({
          date: day.date,
          gameId: g.id,
          gameState: g.gameState,
          startTimeUTC: g.startTimeUTC,
          away: g.awayTeam.abbrev ?? g.awayTeam.name?.default,
          home: g.homeTeam.abbrev ?? g.homeTeam.name?.default,
          venue: g.venue?.default,
          broadcasts: g.tvBroadcasts?.map((b) => `${b.market}: ${b.network}`),
        })),
      );
      return { team: input.teamAbbrev, games };
    }

    // League-wide for a specific date
    const date = input.date ?? new Date().toISOString().slice(0, 10);
    const data = await getScheduleByDate(date);
    const games = (data.gameWeek ?? []).flatMap((day) =>
      day.games.map((g) => ({
        date: day.date,
        gameId: g.id,
        gameState: g.gameState,
        startTimeUTC: g.startTimeUTC,
        away: g.awayTeam.abbrev ?? g.awayTeam.name?.default,
        home: g.homeTeam.abbrev ?? g.homeTeam.name?.default,
        venue: g.venue?.default,
      })),
    );
    return { date, games };
  });
}
