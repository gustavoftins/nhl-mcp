import { z } from "zod";
import { getRoster } from "../api/client.js";
import { safeToolCall } from "../utils/errors.js";

export const teamInfoSchema = z.object({
  teamAbbrev: z
    .string()
    .length(3)
    .toUpperCase()
    .describe('Three-letter team abbreviation, e.g. "TOR", "EDM", "NYR".'),
  season: z
    .string()
    .regex(/^\d{8}$/, 'Must be an 8-digit season ID, e.g. "20242025".')
    .optional()
    .describe('Season in "YYYYYYYY" format, e.g. "20242025". Omit for current season.'),
});

export type TeamInfoInput = z.infer<typeof teamInfoSchema>;

export async function handleGetTeamInfo(input: TeamInfoInput) {
  return safeToolCall(async () => {
    const data = await getRoster(input.teamAbbrev, input.season);

    const mapPlayer = (p: (typeof data.forwards)[number]) => ({
      id: p.id,
      name: `${p.firstName.default} ${p.lastName.default}`,
      number: p.sweaterNumber,
      position: p.positionCode,
      shoots: p.shootsCatches,
      heightCm: p.heightInCentimeters,
      weightKg: p.weightInKilograms,
      birthDate: p.birthDate,
      birthCountry: p.birthCountry,
    });

    return {
      team: input.teamAbbrev,
      season: input.season ?? "current",
      forwards: data.forwards.map(mapPlayer),
      defensemen: data.defensemen.map(mapPlayer),
      goalies: data.goalies.map(mapPlayer),
    };
  });
}
