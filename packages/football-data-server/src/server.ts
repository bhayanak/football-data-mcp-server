import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { FootballConfig } from './config.js'
import { FootballDataClient } from './api/client.js'
import {
  listCompetitionsSchema,
  getCompetitionSchema,
  listCompetitions,
  getCompetition,
} from './tools/competitions.js'
import { getMatchesSchema, getMatchSchema, getMatches, getMatch } from './tools/matches.js'
import { getStandingsSchema, getStandings } from './tools/standings.js'
import { getTeamSchema, getTeamMatchesSchema, getTeam, getTeamMatches } from './tools/teams.js'
import { getPlayerSchema, getPlayer } from './tools/players.js'
import { getScorersSchema, getScorers } from './tools/scorers.js'

export function createFootballMcpServer(config: FootballConfig): McpServer {
  const server = new McpServer({
    name: 'football-data-mcp-server',
    version: '0.1.0',
  })

  const client = new FootballDataClient(config)

  // --- Competitions ---

  server.tool(
    'fb_list_competitions',
    'List football competitions/leagues available through the API. Filter by area/country.',
    listCompetitionsSchema.shape,
    async (params) => {
      try {
        const text = await listCompetitions(client, params.area)
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    },
  )

  server.tool(
    'fb_get_competition',
    'Get detailed information about a specific football competition/league.',
    getCompetitionSchema.shape,
    async (params) => {
      try {
        const text = await getCompetition(client, params.code)
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    },
  )

  // --- Matches ---

  server.tool(
    'fb_get_matches',
    'Get football matches by competition, date range, status, or matchday. Returns live scores, scheduled matches, and results.',
    getMatchesSchema.shape,
    async (params) => {
      try {
        const text = await getMatches(client, params)
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    },
  )

  server.tool(
    'fb_get_match',
    'Get detailed information about a specific match including score, referees, and status.',
    getMatchSchema.shape,
    async (params) => {
      try {
        const text = await getMatch(client, params.matchId)
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    },
  )

  // --- Standings ---

  server.tool(
    'fb_get_standings',
    'Get league standings/table for a competition. Shows position, points, wins, draws, losses, goals, and form.',
    getStandingsSchema.shape,
    async (params) => {
      try {
        const text = await getStandings(client, params.competition, params.season, params.matchday)
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    },
  )

  // --- Teams ---

  server.tool(
    'fb_get_team',
    'Get team information including squad, coach, venue, and running competitions.',
    getTeamSchema.shape,
    async (params) => {
      try {
        const text = await getTeam(client, params.teamId)
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    },
  )

  server.tool(
    'fb_get_team_matches',
    "Get a team's matches filtered by status (scheduled/finished), date range, and limit.",
    getTeamMatchesSchema.shape,
    async (params) => {
      try {
        const text = await getTeamMatches(client, params)
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    },
  )

  // --- Players ---

  server.tool(
    'fb_get_player',
    'Get player information including name, position, nationality, team, and shirt number.',
    getPlayerSchema.shape,
    async (params) => {
      try {
        const text = await getPlayer(client, params.playerId)
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    },
  )

  // --- Scorers ---

  server.tool(
    'fb_get_scorers',
    'Get top scorers for a competition including goals, assists, penalties, and matches played.',
    getScorersSchema.shape,
    async (params) => {
      try {
        const text = await getScorers(client, params.competition, params.season, params.limit)
        return { content: [{ type: 'text' as const, text }] }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    },
  )

  return server
}
