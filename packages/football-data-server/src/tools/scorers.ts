import { z } from 'zod'
import type { FootballDataClient } from '../api/client.js'
import { formatScorers } from '../utils/formatter.js'

export const getScorersSchema = z.object({
  competition: z.string().describe("Competition code (e.g., 'PL')"),
  season: z.number().optional().describe('Season year'),
  limit: z.number().optional().default(10).describe('Number of top scorers to return'),
})

export async function getScorers(
  client: FootballDataClient,
  competition: string,
  season?: number,
  limit?: number,
): Promise<string> {
  const scorers = await client.getScorers(competition, season, limit)
  return formatScorers(scorers, competition)
}
