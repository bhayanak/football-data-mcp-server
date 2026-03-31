import { z } from 'zod'
import type { FootballDataClient } from '../api/client.js'
import { formatCompetitions, formatCompetition } from '../utils/formatter.js'

export const listCompetitionsSchema = z.object({
  area: z
    .string()
    .optional()
    .describe("Filter by area/country (e.g., 'England', 'Spain', 'Europe')"),
})

export const getCompetitionSchema = z.object({
  code: z
    .string()
    .describe("Competition code (e.g., 'PL' for Premier League, 'CL' for Champions League)"),
})

export async function listCompetitions(client: FootballDataClient, area?: string): Promise<string> {
  const competitions = await client.getCompetitions(area)
  return formatCompetitions(competitions)
}

export async function getCompetition(client: FootballDataClient, code: string): Promise<string> {
  const competition = await client.getCompetition(code)
  return formatCompetition(competition)
}
