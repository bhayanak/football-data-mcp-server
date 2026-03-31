import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFootballMcpServer } from '../src/server.js'
import type { FootballConfig } from '../src/config.js'

const testConfig: FootballConfig = {
  apiKey: 'test-api-key',
  baseUrl: 'https://api.football-data.org/v4',
  cacheTtlMs: 60000,
  standingsTtlMs: 300000,
  cacheMaxSize: 100,
  timeoutMs: 10000,
  rateLimit: 100,
}

describe('createFootballMcpServer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a server instance', () => {
    const server = createFootballMcpServer(testConfig)
    expect(server).toBeDefined()
  })

  it('should register all 9 tools', () => {
    const server = createFootballMcpServer(testConfig)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = (server as any)._registeredTools
    const toolNames = Object.keys(tools)
    expect(toolNames).toHaveLength(9)
    expect(toolNames).toContain('fb_list_competitions')
    expect(toolNames).toContain('fb_get_competition')
    expect(toolNames).toContain('fb_get_matches')
    expect(toolNames).toContain('fb_get_match')
    expect(toolNames).toContain('fb_get_standings')
    expect(toolNames).toContain('fb_get_team')
    expect(toolNames).toContain('fb_get_team_matches')
    expect(toolNames).toContain('fb_get_player')
    expect(toolNames).toContain('fb_get_scorers')
  })
})
