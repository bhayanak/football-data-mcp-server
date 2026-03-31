import { z } from 'zod'
import type { FootballDataClient } from '../api/client.js'
import type { MatchStatus } from '../api/types.js'
import { formatTeam, formatTeamMatches } from '../utils/formatter.js'

export const getTeamSchema = z.object({
  teamId: z.number().describe('Team ID'),
})

export const getTeamMatchesSchema = z.object({
  teamId: z.number().describe('Team ID'),
  status: z.enum(['SCHEDULED', 'FINISHED']).optional().describe('Filter by match status'),
  dateFrom: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  dateTo: z.string().optional().describe('End date (YYYY-MM-DD)'),
  limit: z.number().optional().default(10).describe('Maximum number of matches'),
})

export async function getTeam(client: FootballDataClient, teamId: number): Promise<string> {
  const team = await client.getTeam(teamId)
  return formatTeam(team)
}

export async function getTeamMatches(
  client: FootballDataClient,
  params: {
    teamId: number
    status?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
  },
): Promise<string> {
  const matches = await client.getTeamMatches(params.teamId, {
    status: params.status as MatchStatus | undefined,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    limit: params.limit,
  })
  return formatTeamMatches(matches)
}
