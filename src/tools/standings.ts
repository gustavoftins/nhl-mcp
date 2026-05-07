import { z } from "zod";
import { getStandings } from "../api/client.js";
import { safeToolCall } from "../utils/errors.js";

export const standingsSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be "YYYY-MM-DD"')
    .optional()
    .describe("Date for historical standings. Omit for current standings."),
  conference: z
    .enum(["E", "W"])
    .optional()
    .describe('Filter by conference: "E" for Eastern, "W" for Western.'),
  division: z
    .string()
    .optional()
    .describe('Filter by division abbreviation, e.g. "A", "M", "C", "P".'),
});

export type StandingsInput = z.infer<typeof standingsSchema>;

export async function handleGetStandings(input: StandingsInput) {
  return safeToolCall(async () => {
    const data = await getStandings(input.date);

    let teams = data.standings;

    if (input.conference) {
      teams = teams.filter(
        (t) => t.conferenceAbbrev?.toUpperCase() === input.conference,
      );
    }

    if (input.division) {
      teams = teams.filter(
        (t) => t.divisionAbbrev?.toUpperCase() === input.division?.toUpperCase(),
      );
    }

    return {
      date: input.date ?? "current",
      standings: teams.map((t) => ({
        rank: t.leagueSequence,
        divisionRank: t.divisionSequence,
        conferenceRank: t.conferenceSequence,
        team: t.teamAbbrev.default,
        teamName: t.teamName.default,
        conference: t.conferenceAbbrev,
        division: t.divisionAbbrev,
        gp: t.gamesPlayed,
        w: t.wins,
        l: t.losses,
        otl: t.otLosses,
        pts: t.points,
        ptsPct: t.pointPctg.toFixed(3),
        gf: t.goalFor,
        ga: t.goalAgainst,
        diff: t.goalDifferential,
        streak: t.streakCode && t.streakCount ? `${t.streakCode}${t.streakCount}` : undefined,
      })),
    };
  });
}
