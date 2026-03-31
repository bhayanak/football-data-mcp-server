import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFootballMcpServer } from '../src/server.js'
import type { FootballConfig } from '../src/config.js'

// Mock all tool modules so we can control success/failure
vi.mock('../src/tools/competitions.js', async (importOriginal) => {
  const orig = (await importOriginal()) as Record<string, unknown>
  return { ...orig, listCompetitions: vi.fn(), getCompetition: vi.fn() }
})
vi.mock('../src/tools/matches.js', async (importOriginal) => {
  const orig = (await importOriginal()) as Record<string, unknown>
  return { ...orig, getMatches: vi.fn(), getMatch: vi.fn() }
})
vi.mock('../src/tools/standings.js', async (importOriginal) => {
  const orig = (await importOriginal()) as Record<string, unknown>
  return { ...orig, getStandings: vi.fn() }
})
vi.mock('../src/tools/teams.js', async (importOriginal) => {
  const orig = (await importOriginal()) as Record<string, unknown>
  return { ...orig, getTeam: vi.fn(), getTeamMatches: vi.fn() }
})
vi.mock('../src/tools/players.js', async (importOriginal) => {
  const orig = (await importOriginal()) as Record<string, unknown>
  return { ...orig, getPlayer: vi.fn() }
})
vi.mock('../src/tools/scorers.js', async (importOriginal) => {
  const orig = (await importOriginal()) as Record<string, unknown>
  return { ...orig, getScorers: vi.fn() }
})

import { listCompetitions, getCompetition } from '../src/tools/competitions.js'
import { getMatches, getMatch } from '../src/tools/matches.js'
import { getStandings } from '../src/tools/standings.js'
import { getTeam, getTeamMatches } from '../src/tools/teams.js'
import { getPlayer } from '../src/tools/players.js'
import { getScorers } from '../src/tools/scorers.js'

const testConfig: FootballConfig = {
  apiKey: 'test-key',
  baseUrl: 'https://api.football-data.org/v4',
  cacheTtlMs: 60000,
  standingsTtlMs: 300000,
  cacheMaxSize: 100,
  timeoutMs: 10000,
  rateLimit: 100,
}

const allMocks = () => [
  listCompetitions,
  getCompetition,
  getMatches,
  getMatch,
  getStandings,
  getTeam,
  getTeamMatches,
  getPlayer,
  getScorers,
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getHandler(server: any, name: string) {
  return server._registeredTools[name].handler
}

describe('server tool handlers — success paths', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    for (const mock of allMocks()) {
      vi.mocked(mock).mockResolvedValue('ok')
    }
  })

  const tools = [
    'fb_list_competitions',
    'fb_get_competition',
    'fb_get_matches',
    'fb_get_match',
    'fb_get_standings',
    'fb_get_team',
    'fb_get_team_matches',
    'fb_get_player',
    'fb_get_scorers',
  ] as const

  for (const name of tools) {
    it(`${name} returns content on success`, async () => {
      const server = createFootballMcpServer(testConfig)
      const result = await getHandler(server, name)({}, {})
      expect(result.isError).toBeUndefined()
      expect(result.content[0]).toEqual({ type: 'text', text: 'ok' })
    })
  }
})

describe('server tool handlers — error paths', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    for (const mock of allMocks()) {
      vi.mocked(mock).mockRejectedValue(new Error('API failure'))
    }
  })

  const tools = [
    'fb_list_competitions',
    'fb_get_competition',
    'fb_get_matches',
    'fb_get_match',
    'fb_get_standings',
    'fb_get_team',
    'fb_get_team_matches',
    'fb_get_player',
    'fb_get_scorers',
  ] as const

  for (const name of tools) {
    it(`${name} returns error on failure`, async () => {
      const server = createFootballMcpServer(testConfig)
      const result = await getHandler(server, name)({}, {})
      expect(result.isError).toBe(true)
      expect(result.content[0].text).toContain('API failure')
    })
  }
})
