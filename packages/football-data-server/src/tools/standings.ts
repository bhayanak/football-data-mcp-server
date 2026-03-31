import { z } from 'zod'
import type { FootballDataClient } from '../api/client.js'
import { formatStandings } from '../utils/formatter.js'

export const getStandingsSchema = z.object({
  competition: z.string().describe("Competition code (e.g., 'PL')"),
  season: z.number().optional().describe('Season year (e.g., 2024 for 2024-25 season)'),
  matchday: z.number().optional().describe('Standings as of matchday'),
})

export async function getStandings(
  client: FootballDataClient,
  competition: string,
  season?: number,
  matchday?: number,
): Promise<string> {
  const standings = await client.getStandings(competition, season, matchday)
  return formatStandings(standings, competition)
}
