import { z } from "zod";
import { getPlayerLanding, searchPlayer } from "../api/client.js";
import { safeToolCall } from "../utils/errors.js";

export const playerInfoSchema = z.object({
  playerId: z
    .number()
    .int()
    .positive()
    .describe("NHL player ID (numeric). Use search_player to find the ID by name."),
});

export const playerSearchSchema = z.object({
  query: z
    .string()
    .min(3, "Query must be at least 3 characters.")
    .describe("Player name or partial name to search for, e.g. \"McDavid\", \"Auston\"."),
});

export type PlayerInfoInput = z.infer<typeof playerInfoSchema>;
export type PlayerSearchInput = z.infer<typeof playerSearchSchema>;

export async function handleGetPlayerInfo(input: PlayerInfoInput) {
  return safeToolCall(async () => {
    const p = await getPlayerLanding(input.playerId);

    const currentSeason = p.featuredStats?.season;
    const currentStats = p.featuredStats?.regularSeason?.subSeason;

    return {
      id: p.playerId,
      name: `${p.firstName.default} ${p.lastName.default}`,
      isActive: p.isActive,
      team: p.currentTeamAbbrev,
      number: p.sweaterNumber,
      position: p.position,
      shoots: p.shootsCatches,
      heightCm: p.heightInCentimeters,
      weightKg: p.weightInKilograms,
      birthDate: p.birthDate,
      birthCountry: p.birthCountry,
      draft: p.draftDetails
        ? {
            year: p.draftDetails.year,
            team: p.draftDetails.teamAbbrev,
            round: p.draftDetails.round,
            overall: p.draftDetails.overallPick,
          }
        : undefined,
      currentSeason: currentSeason
        ? {
            season: currentSeason,
            gamesPlayed: currentStats?.gamesPlayed,
            goals: currentStats?.goals,
            assists: currentStats?.assists,
            points: currentStats?.points,
            plusMinus: currentStats?.plusMinus,
            pim: currentStats?.pim,
            shots: currentStats?.shots,
            shootingPct: currentStats?.shootingPctg,
            // Goalie
            wins: currentStats?.wins,
            losses: currentStats?.losses,
            savePct: currentStats?.savePctg,
            gaa: currentStats?.goalsAgainstAvg,
            shutouts: currentStats?.shutouts,
          }
        : undefined,
      last5Games: p.last5Games?.map((g) => ({
        date: g.gameDate,
        opponent: g.opponentAbbrev,
        goals: g.goals,
        assists: g.assists,
        points: g.points,
        plusMinus: g.plusMinus,
        toi: g.toi,
        // Goalie
        decision: g.decision,
        savePct: g.savePctg,
      })),
    };
  });
}

export async function handleSearchPlayer(input: PlayerSearchInput) {
  return safeToolCall(async () => {
    const data = await searchPlayer(input.query);
    if (!data.players || data.players.length === 0) {
      return { query: input.query, message: "No players found.", players: [] };
    }
    return {
      query: input.query,
      players: data.players.map((p) => ({
        id: p.playerId,
        name: p.name,
        position: p.positionCode,
        team: p.teamAbbrev,
        number: p.sweaterNumber,
        active: !p.lastSeasonId, // if lastSeasonId is set, player is retired
      })),
    };
  });
}
