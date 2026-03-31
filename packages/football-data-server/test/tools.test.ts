import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listCompetitions, getCompetition } from '../src/tools/competitions.js'
import { getMatches, getMatch } from '../src/tools/matches.js'
import { getStandings } from '../src/tools/standings.js'
import { getTeam, getTeamMatches } from '../src/tools/teams.js'
import { getPlayer } from '../src/tools/players.js'
import { getScorers } from '../src/tools/scorers.js'
import type { FootballDataClient } from '../src/api/client.js'
import competitionPl from './fixtures/competition-pl.json'
import standingsPl from './fixtures/standings-pl.json'
import matchDetail from './fixtures/match-detail.json'
import teamFixture from './fixtures/team.json'

function createMockClient(): FootballDataClient {
  return {
    getCompetitions: vi.fn().mockResolvedValue([competitionPl]),
    getCompetition: vi.fn().mockResolvedValue(competitionPl),
    getMatches: vi.fn().mockResolvedValue([matchDetail]),
    getMatch: vi.fn().mockResolvedValue(matchDetail),
    getStandings: vi.fn().mockResolvedValue(standingsPl.standings),
    getTeam: vi.fn().mockResolvedValue(teamFixture),
    getTeamMatches: vi.fn().mockResolvedValue([matchDetail]),
    getPlayer: vi.fn().mockResolvedValue({
      id: 104,
      name: 'Bukayo Saka',
      firstName: 'Bukayo',
      lastName: 'Saka',
      dateOfBirth: '2001-09-05',
      nationality: 'England',
      position: 'Offence',
      shirtNumber: 7,
      currentTeam: { id: 57, name: 'Arsenal FC', shortName: 'Arsenal', tla: 'ARS', crest: '' },
    }),
    getScorers: vi.fn().mockResolvedValue([
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
    ]),
  } as unknown as FootballDataClient
}

describe('Tool functions', () => {
  let client: FootballDataClient

  beforeEach(() => {
    client = createMockClient()
  })

  describe('competitions', () => {
    it('listCompetitions returns formatted output', async () => {
      const result = await listCompetitions(client)
      expect(result).toContain('Premier League')
      expect(client.getCompetitions).toHaveBeenCalledWith(undefined)
    })

    it('listCompetitions passes area filter', async () => {
      await listCompetitions(client, 'England')
      expect(client.getCompetitions).toHaveBeenCalledWith('England')
    })

    it('getCompetition returns formatted output', async () => {
      const result = await getCompetition(client, 'PL')
      expect(result).toContain('Premier League')
      expect(client.getCompetition).toHaveBeenCalledWith('PL')
    })
  })

  describe('matches', () => {
    it('getMatches returns formatted output', async () => {
      const result = await getMatches(client, { competition: 'PL', limit: 10 })
      expect(result).toContain('Arsenal')
      expect(client.getMatches).toHaveBeenCalled()
    })

    it('getMatch returns formatted output', async () => {
      const result = await getMatch(client, 12345)
      expect(result).toContain('Arsenal')
      expect(client.getMatch).toHaveBeenCalledWith(12345)
    })
  })

  describe('standings', () => {
    it('getStandings returns formatted output', async () => {
      const result = await getStandings(client, 'PL')
      expect(result).toContain('Liverpool')
      expect(client.getStandings).toHaveBeenCalledWith('PL', undefined, undefined)
    })

    it('getStandings passes season and matchday', async () => {
      await getStandings(client, 'PL', 2024, 15)
      expect(client.getStandings).toHaveBeenCalledWith('PL', 2024, 15)
    })
  })

  describe('teams', () => {
    it('getTeam returns formatted output', async () => {
      const result = await getTeam(client, 57)
      expect(result).toContain('Arsenal FC')
      expect(client.getTeam).toHaveBeenCalledWith(57)
    })

    it('getTeamMatches returns formatted output', async () => {
      const result = await getTeamMatches(client, { teamId: 57, limit: 5 })
      expect(result).toContain('Arsenal')
      expect(client.getTeamMatches).toHaveBeenCalled()
    })
  })

  describe('players', () => {
    it('getPlayer returns formatted output', async () => {
      const result = await getPlayer(client, 104)
      expect(result).toContain('Bukayo Saka')
      expect(client.getPlayer).toHaveBeenCalledWith(104)
    })
  })

  describe('scorers', () => {
    it('getScorers returns formatted output', async () => {
      const result = await getScorers(client, 'PL')
      expect(result).toContain('M. Salah')
      expect(client.getScorers).toHaveBeenCalledWith('PL', undefined, undefined)
    })

    it('getScorers passes season and limit', async () => {
      await getScorers(client, 'PL', 2024, 10)
      expect(client.getScorers).toHaveBeenCalledWith('PL', 2024, 10)
    })
  })
})
