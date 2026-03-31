import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FootballDataClient } from '../src/api/client.js'
import type { FootballConfig } from '../src/config.js'
import competitionPl from './fixtures/competition-pl.json'
import standingsPl from './fixtures/standings-pl.json'
import matchDetail from './fixtures/match-detail.json'
import teamFixture from './fixtures/team.json'

const testConfig: FootballConfig = {
  apiKey: 'test-api-key',
  baseUrl: 'https://api.football-data.org/v4',
  cacheTtlMs: 60000,
  standingsTtlMs: 300000,
  cacheMaxSize: 100,
  timeoutMs: 10000,
  rateLimit: 100,
}

function mockFetch(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

describe('FootballDataClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch competitions', async () => {
    const fetchMock = mockFetch({ count: 1, competitions: [competitionPl] })
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    const result = await client.getCompetitions()

    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('PL')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/competitions'),
      expect.objectContaining({
        headers: { 'X-Auth-Token': 'test-api-key' },
      }),
    )
  })

  it('should fetch competitions filtered by area', async () => {
    const fetchMock = mockFetch({ count: 1, competitions: [competitionPl] })
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    await client.getCompetitions('England')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('areas=England'),
      expect.anything(),
    )
  })

  it('should fetch a single competition', async () => {
    const fetchMock = mockFetch(competitionPl)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    const result = await client.getCompetition('PL')

    expect(result.code).toBe('PL')
    expect(result.name).toBe('Premier League')
  })

  it('should fetch matches', async () => {
    const fetchMock = mockFetch({ resultSet: { count: 1 }, matches: [matchDetail] })
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    const result = await client.getMatches({ competition: 'PL', limit: 10 })

    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('FINISHED')
  })

  it('should fetch matches with all query params', async () => {
    const fetchMock = mockFetch({ resultSet: { count: 0 }, matches: [] })
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    await client.getMatches({
      competition: 'PL',
      dateFrom: '2024-12-01',
      dateTo: '2024-12-31',
      status: 'FINISHED',
      matchday: 15,
      limit: 5,
    })

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('/competitions/PL/matches')
    expect(url).toContain('dateFrom=2024-12-01')
    expect(url).toContain('dateTo=2024-12-31')
    expect(url).toContain('status=FINISHED')
    expect(url).toContain('matchday=15')
    expect(url).toContain('limit=5')
  })

  it('should fetch matches without competition', async () => {
    const fetchMock = mockFetch({ resultSet: { count: 0 }, matches: [] })
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    await client.getMatches({ limit: 10 })

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('/matches')
    expect(url).not.toContain('/competitions/')
  })

  it('should fetch a single match', async () => {
    const fetchMock = mockFetch(matchDetail)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    const result = await client.getMatch(12345)

    expect(result.id).toBe(12345)
    expect(result.homeTeam.shortName).toBe('Arsenal')
  })

  it('should fetch standings', async () => {
    const fetchMock = mockFetch(standingsPl)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    const result = await client.getStandings('PL')

    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('TOTAL')
  })

  it('should fetch standings with season and matchday', async () => {
    const fetchMock = mockFetch(standingsPl)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    await client.getStandings('PL', 2024, 15)

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('season=2024')
    expect(url).toContain('matchday=15')
  })

  it('should fetch team', async () => {
    const fetchMock = mockFetch(teamFixture)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    const result = await client.getTeam(57)

    expect(result.name).toBe('Arsenal FC')
    expect(result.squad).toHaveLength(4)
  })

  it('should fetch team matches', async () => {
    const fetchMock = mockFetch({ resultSet: { count: 1 }, matches: [matchDetail] })
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    const result = await client.getTeamMatches(57, {
      status: 'FINISHED',
      dateFrom: '2024-12-01',
      dateTo: '2024-12-31',
      limit: 5,
    })

    expect(result).toHaveLength(1)
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('/teams/57/matches')
  })

  it('should fetch player', async () => {
    const playerData = {
      id: 104,
      name: 'Bukayo Saka',
      firstName: 'Bukayo',
      lastName: 'Saka',
      dateOfBirth: '2001-09-05',
      nationality: 'England',
      position: 'Offence',
      shirtNumber: 7,
      currentTeam: { id: 57, name: 'Arsenal FC', shortName: 'Arsenal', tla: 'ARS', crest: '' },
    }
    const fetchMock = mockFetch(playerData)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    const result = await client.getPlayer(104)

    expect(result.name).toBe('Bukayo Saka')
    expect(result.position).toBe('Offence')
  })

  it('should fetch scorers', async () => {
    const scorersData = {
      competition: competitionPl,
      season: competitionPl.currentSeason,
      scorers: [
        {
          player: {
            id: 1,
            name: 'M. Salah',
            firstName: 'Mohamed',
            lastName: 'Salah',
            dateOfBirth: '',
            nationality: 'Egypt',
            position: 'Offence',
            shirtNumber: 11,
          },
          team: { id: 64, name: 'Liverpool FC', shortName: 'Liverpool', tla: 'LIV', crest: '' },
          playedMatches: 15,
          goals: 14,
          assists: 8,
          penalties: 3,
        },
      ],
    }
    const fetchMock = mockFetch(scorersData)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    const result = await client.getScorers('PL', 2024, 10)

    expect(result).toHaveLength(1)
    expect(result[0].goals).toBe(14)
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('season=2024')
    expect(url).toContain('limit=10')
  })

  it('should use cached responses', async () => {
    const fetchMock = mockFetch(competitionPl)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    await client.getCompetition('PL')
    await client.getCompetition('PL')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('should handle API errors', async () => {
    const fetchMock = mockFetch({ message: 'Forbidden' }, 403)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    await expect(client.getCompetition('PL')).rejects.toThrow('API error 403')
  })

  it('should handle rate limit errors', async () => {
    const fetchMock = mockFetch({ message: 'Too Many Requests' }, 429)
    vi.stubGlobal('fetch', fetchMock)

    const client = new FootballDataClient(testConfig)
    await expect(client.getCompetition('PL')).rejects.toThrow('Rate limit exceeded')
  })
})
