import { z } from 'zod'
import type { FootballDataClient } from '../api/client.js'
import type { MatchStatus } from '../api/types.js'
import { formatMatches, formatMatch } from '../utils/formatter.js'

export const getMatchesSchema = z.object({
  competition: z.string().optional().describe("Competition code (e.g., 'PL')"),
  dateFrom: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  dateTo: z.string().optional().describe('End date (YYYY-MM-DD)'),
  status: z
    .enum(['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELLED'])
    .optional()
    .describe('Filter by match status'),
  matchday: z.number().optional().describe('Specific matchday number'),
  limit: z.number().optional().default(20).describe('Maximum number of matches to return'),
})

export const getMatchSchema = z.object({
  matchId: z.number().describe('Match ID'),
})

export async function getMatches(
  client: FootballDataClient,
  params: {
    competition?: string
    dateFrom?: string
    dateTo?: string
    status?: string
    matchday?: number
    limit?: number
  },
): Promise<string> {
  const matches = await client.getMatches({
    competition: params.competition,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    status: params.status as MatchStatus | undefined,
    matchday: params.matchday,
    limit: params.limit,
  })
  return formatMatches(matches)
}

export async function getMatch(client: FootballDataClient, matchId: number): Promise<string> {
  const match = await client.getMatch(matchId)
  return formatMatch(match)
}
