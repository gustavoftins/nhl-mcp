/**
 * Hand-crafted types for api-web.nhle.com.
 * These are reverse-engineered from live responses — field presence is not guaranteed.
 * All optional fields use `| undefined` to force defensive access at call sites.
 */

// ─── Shared primitives ────────────────────────────────────────────────────────

export interface LocalizedName {
  default: string;
  fr?: string;
}

export interface TeamAbbrev {
  default: string;
}

export interface Logo {
  url: string;
  fileExtension?: string;
  tags?: string[];
}

// ─── Schedule / Scores ────────────────────────────────────────────────────────

export type GameState =
  | "FUT"   // Future (not started)
  | "PRE"   // Pre-game
  | "LIVE"  // In progress
  | "CRIT"  // Critical (late in a close game — used for live score emphasis)
  | "FINAL" // Final (official)
  | "OFF";  // Off (no game)

export interface TeamScore {
  id: number;
  name?: LocalizedName;
  abbrev?: string;
  logo?: string;
  score?: number;
  sog?: number; // Shots on goal
}

export interface PeriodDescriptor {
  number: number;
  periodType: "REG" | "OT" | "SO";
  otPeriods?: number;
}

export interface ScheduleGame {
  id: number;
  season: number;
  gameType: number; // 1=preseason, 2=regular, 3=playoffs
  gameDate: string; // "YYYY-MM-DD"
  startTimeUTC: string;
  easternUTCOffset: string;
  venueUTCOffset: string;
  gameState: GameState;
  gameScheduleState: string;
  tvBroadcasts?: TvBroadcast[];
  awayTeam: TeamScore;
  homeTeam: TeamScore;
  periodDescriptor?: PeriodDescriptor;
  clock?: GameClock;
  venue?: LocalizedName;
  neutralSite?: boolean;
  specialEvent?: LocalizedName;
}

export interface TvBroadcast {
  id: number;
  market: string;
  countryCode: string;
  network: string;
  sequenceNumber: number;
}

export interface GameClock {
  timeRemaining: string;
  secondsRemaining: number;
  running: boolean;
  inIntermission: boolean;
}

export interface DaySchedule {
  date: string;
  games: ScheduleGame[];
}

export interface ScheduleResponse {
  nextStartDate?: string;
  previousStartDate?: string;
  gameWeek?: DaySchedule[];
  currentSeason?: SeasonInfo;
}

export interface ScoreResponse {
  date: string;
  games: ScheduleGame[];
}

// ─── Standings ─────────────────────────────────────────────────────────────────

export interface StandingsTeam {
  conferenceAbbrev?: string;
  conferenceName?: LocalizedName;
  conferenceSequence?: number;
  date: string;
  divisionAbbrev?: string;
  divisionName?: LocalizedName;
  divisionSequence?: number;
  gameTypeId: number;
  gamesPlayed: number;
  goalDifferential: number;
  goalDifferentialPctg: number;
  goalAgainst: number;
  goalFor: number;
  goalsForPctg: number;
  homeGamesPlayed?: number;
  homeGoalDifferential?: number;
  homeGoalsAgainst?: number;
  homeGoalsFor?: number;
  homeLosses?: number;
  homeOtLosses?: number;
  homePoints?: number;
  homeRegulationPlusOtWins?: number;
  homeRegulationWins?: number;
  homeWins?: number;
  l10GamesPlayed?: number;
  l10GoalDifferential?: number;
  l10GoalsAgainst?: number;
  l10GoalsFor?: number;
  l10Losses?: number;
  l10OtLosses?: number;
  l10Points?: number;
  l10RegulationPlusOtWins?: number;
  l10RegulationWins?: number;
  l10Wins?: number;
  leagueSequence?: number;
  losses: number;
  otLosses: number;
  placeName: LocalizedName;
  pointPctg: number;
  points: number;
  regulationPlusOtWinPctg?: number;
  regulationPlusOtWins?: number;
  regulationWinPctg?: number;
  regulationWins?: number;
  roadGamesPlayed?: number;
  roadGoalDifferential?: number;
  roadGoalsAgainst?: number;
  roadGoalsFor?: number;
  roadLosses?: number;
  roadOtLosses?: number;
  roadPoints?: number;
  roadRegulationPlusOtWins?: number;
  roadRegulationWins?: number;
  roadWins?: number;
  seasonId: number;
  shootoutLosses?: number;
  shootoutWins?: number;
  streakCode?: string;
  streakCount?: number;
  teamName: LocalizedName;
  teamAbbrev: TeamAbbrev;
  teamCommonName?: LocalizedName;
  teamLogo?: string;
  waiversSequence?: number;
  wildcardSequence?: number;
  wins: number;
}

export interface StandingsResponse {
  wildCardIndicator: boolean;
  standings: StandingsTeam[];
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface RosterPlayer {
  id: number;
  headshot?: string;
  firstName: LocalizedName;
  lastName: LocalizedName;
  sweaterNumber?: number;
  positionCode: "C" | "L" | "R" | "D" | "G";
  shootsCatches: "L" | "R";
  heightInInches?: number;
  weightInPounds?: number;
  heightInCentimeters?: number;
  weightInKilograms?: number;
  birthDate?: string;
  birthCity?: LocalizedName;
  birthStateProvince?: LocalizedName;
  birthCountry?: string;
}

export interface RosterResponse {
  forwards: RosterPlayer[];
  defensemen: RosterPlayer[];
  goalies: RosterPlayer[];
}

// ─── Players ──────────────────────────────────────────────────────────────────

export interface PlayerSeasonTotals {
  season: number;
  gameTypeId: number;
  leagueAbbrev?: string;
  teamName?: LocalizedName;
  sequence?: number;
  gamesPlayed: number;
  goals?: number;
  assists?: number;
  points?: number;
  plusMinus?: number;
  pim?: number;
  gameWinningGoals?: number;
  otGoals?: number;
  shots?: number;
  shootingPctg?: number;
  powerPlayGoals?: number;
  powerPlayPoints?: number;
  shorthandedGoals?: number;
  shorthandedPoints?: number;
  // Goalie stats
  wins?: number;
  losses?: number;
  otLosses?: number;
  savePctg?: number;
  goalsAgainstAvg?: number;
  shotsAgainst?: number;
  saves?: number;
  shutouts?: number;
}

export interface PlayerLanding {
  playerId: number;
  isActive: boolean;
  currentTeamId?: number;
  currentTeamAbbrev?: string;
  fullTeamName?: LocalizedName;
  firstName: LocalizedName;
  lastName: LocalizedName;
  teamLogo?: string;
  sweaterNumber?: number;
  position: string;
  headshot?: string;
  heroImage?: string;
  heightInInches?: number;
  heightInCentimeters?: number;
  weightInPounds?: number;
  weightInKilograms?: number;
  birthDate?: string;
  birthCity?: LocalizedName;
  birthStateProvince?: LocalizedName;
  birthCountry?: string;
  shootsCatches?: string;
  draftDetails?: DraftDetails;
  playerSlug?: string;
  inTop100AllTime?: number;
  inHHOF?: number;
  featuredStats?: FeaturedStats;
  careerTotals?: { regularSeason?: PlayerSeasonTotals; playoffs?: PlayerSeasonTotals };
  seasonTotals?: PlayerSeasonTotals[];
  last5Games?: Last5Game[];
}

export interface DraftDetails {
  year?: number;
  teamAbbrev?: string;
  round?: number;
  pickInRound?: number;
  overallPick?: number;
}

export interface FeaturedStats {
  season: number;
  regularSeason?: { subSeason?: PlayerSeasonTotals; career?: PlayerSeasonTotals };
}

export interface Last5Game {
  assists: number;
  gameDate: string;
  gameId: number;
  gameTypeId: number;
  goals: number;
  homeRoadFlag: "H" | "R";
  opponentAbbrev: string;
  pim: number;
  plusMinus: number;
  points: number;
  powerPlayGoals: number;
  shifts?: number;
  shorthandedGoals: number;
  shots: number;
  toi: string;
  // Goalie
  decision?: "W" | "L" | "O";
  savePctg?: number;
  shotsAgainst?: number;
}

// ─── Player search ────────────────────────────────────────────────────────────

export interface PlayerSearchResult {
  playerId: number;
  name: string;
  positionCode: string;
  teamAbbrev?: string;
  teamId?: number;
  teamName?: LocalizedName;
  sweaterNumber?: number;
  lastSeasonId?: number;
}

export interface PlayerSearchResponse {
  players: PlayerSearchResult[];
}

// ─── Game detail ──────────────────────────────────────────────────────────────

export interface BoxscoreTeamStats {
  sog?: number;
  faceoffWinningPctg?: number;
  powerPlayConversion?: string;
  pim?: number;
  hits?: number;
  blockedShots?: number;
  giveaways?: number;
  takeaways?: number;
}

export interface BoxscoreResponse {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  venue?: LocalizedName;
  startTimeUTC?: string;
  gameState: GameState;
  periodDescriptor?: PeriodDescriptor;
  awayTeam: TeamScore & { onIce?: number[] };
  homeTeam: TeamScore & { onIce?: number[] };
  clock?: GameClock;
  playerByGameStats?: unknown; // Shape varies heavily; consumers should handle raw
  teamGameStats?: { awayTeam: BoxscoreTeamStats; homeTeam: BoxscoreTeamStats };
}

// ─── Season info ──────────────────────────────────────────────────────────────

export interface SeasonInfo {
  id: number;
  regularSeasonStartDate: string;
  regularSeasonEndDate: string;
  seasonEndDate: string;
  numberOfGames: number;
}
