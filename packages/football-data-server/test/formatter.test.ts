import { describe, it, expect } from 'vitest'
import {
  formatCompetitions,
  formatCompetition,
  formatMatches,
  formatMatch,
  formatStandings,
  formatTeam,
  formatTeamMatches,
  formatPlayer,
  formatScorers,
} from '../src/utils/formatter.js'
import type { Competition, Match, Standing, Team, Player, Scorer } from '../src/api/types.js'
import competitionPl from './fixtures/competition-pl.json'
import standingsPl from './fixtures/standings-pl.json'
import matchDetail from './fixtures/match-detail.json'
import teamFixture from './fixtures/team.json'

describe('formatCompetitions', () => {
  it('should format a list of competitions', () => {
    const result = formatCompetitions([competitionPl as unknown as Competition])
    expect(result).toContain('Available Competitions')
    expect(result).toContain('PL')
    expect(result).toContain('Premier League')
    expect(result).toContain('England')
  })

  it('should handle empty list', () => {
    const result = formatCompetitions([])
    expect(result).toContain('Available Competitions')
  })

  it('should handle competition with no currentSeason', () => {
    const comp = { ...competitionPl, currentSeason: null } as unknown as Competition
    const result = formatCompetitions([comp])
    expect(result).toContain('PL')
    expect(result).toContain('Premier League')
  })

  it('should handle competition with no endDate', () => {
    const comp = {
      ...competitionPl,
      currentSeason: { ...competitionPl.currentSeason, endDate: null },
    } as unknown as Competition
    const result = formatCompetitions([comp])
    expect(result).toContain('2024')
  })

  it('should handle competition with no area', () => {
    const comp = { ...competitionPl, area: null } as unknown as Competition
    const result = formatCompetitions([comp])
    expect(result).toContain('PL')
  })

  it('should handle competition with no startDate', () => {
    const comp = {
      ...competitionPl,
      currentSeason: { ...competitionPl.currentSeason, startDate: null },
    } as unknown as Competition
    const result = formatCompetitions([comp])
    expect(result).toContain('PL')
  })
})

describe('formatCompetition', () => {
  it('should format competition details', () => {
    const result = formatCompetition(competitionPl as unknown as Competition)
    expect(result).toContain('Premier League')
    expect(result).toContain('PL')
    expect(result).toContain('LEAGUE')
    expect(result).toContain('England')
    expect(result).toContain('28')
    expect(result).toContain('Matchday 15')
  })

  it('should handle competition without currentSeason', () => {
    const comp = { ...competitionPl, currentSeason: null } as unknown as Competition
    const result = formatCompetition(comp)
    expect(result).toContain('Premier League')
    expect(result).not.toContain('Current Season')
  })

  it('should handle competition without currentMatchday', () => {
    const comp = {
      ...competitionPl,
      currentSeason: { ...competitionPl.currentSeason, currentMatchday: null },
    } as unknown as Competition
    const result = formatCompetition(comp)
    expect(result).toContain('Current Season')
    expect(result).not.toContain('Matchday')
  })

  it('should handle competition without area', () => {
    const comp = { ...competitionPl, area: null } as unknown as Competition
    const result = formatCompetition(comp)
    expect(result).toContain('N/A')
  })
})

describe('formatMatches', () => {
  it('should format finished matches', () => {
    const result = formatMatches([matchDetail as unknown as Match])
    expect(result).toContain('Premier League')
    expect(result).toContain('Arsenal')
    expect(result).toContain('Everton')
    expect(result).toContain('2 - 1')
    expect(result).toContain('FT')
  })

  it('should format live matches', () => {
    const live = {
      ...matchDetail,
      status: 'IN_PLAY',
      score: { ...matchDetail.score, fullTime: { home: 1, away: 0 } },
    }
    const result = formatMatches([live as unknown as Match])
    expect(result).toContain('LIVE')
    expect(result).toContain('🟢')
  })

  it('should format scheduled matches', () => {
    const scheduled = { ...matchDetail, status: 'SCHEDULED' }
    const result = formatMatches([scheduled as unknown as Match])
    expect(result).toContain('🔵')
    expect(result).toContain('vs')
    expect(result).toContain('Status: SCHEDULED')
  })

  it('should format timed matches', () => {
    const timed = { ...matchDetail, status: 'TIMED' }
    const result = formatMatches([timed as unknown as Match])
    expect(result).toContain('🔵')
  })

  it('should format postponed matches', () => {
    const postponed = { ...matchDetail, status: 'POSTPONED' }
    const result = formatMatches([postponed as unknown as Match])
    expect(result).toContain('🟡')
  })

  it('should format cancelled matches', () => {
    const cancelled = { ...matchDetail, status: 'CANCELLED' }
    const result = formatMatches([cancelled as unknown as Match])
    expect(result).toContain('🟡')
  })

  it('should format suspended matches', () => {
    const suspended = { ...matchDetail, status: 'SUSPENDED' }
    const result = formatMatches([suspended as unknown as Match])
    expect(result).toContain('🟡')
  })

  it('should format paused matches', () => {
    const paused = {
      ...matchDetail,
      status: 'PAUSED',
      score: { ...matchDetail.score, fullTime: { home: 1, away: 1 } },
    }
    const result = formatMatches([paused as unknown as Match])
    expect(result).toContain('LIVE')
    expect(result).toContain('🟢')
  })

  it('should group matches by competition', () => {
    const m2 = {
      ...matchDetail,
      competition: { ...matchDetail.competition, name: 'La Liga' },
    }
    const result = formatMatches([matchDetail as unknown as Match, m2 as unknown as Match])
    expect(result).toContain('Premier League')
    expect(result).toContain('La Liga')
  })

  it('should include cache disclaimer', () => {
    const result = formatMatches([matchDetail as unknown as Match])
    expect(result).toContain('cached')
  })

  it('should return message for empty list', () => {
    expect(formatMatches([])).toBe('No matches found.')
  })

  it('should use team name when shortName is missing', () => {
    const m = {
      ...matchDetail,
      homeTeam: { ...matchDetail.homeTeam, shortName: null, name: 'Arsenal FC' },
      awayTeam: { ...matchDetail.awayTeam, shortName: null, name: 'Everton FC' },
    }
    const result = formatMatches([m as unknown as Match])
    expect(result).toContain('Arsenal FC')
    expect(result).toContain('Everton FC')
  })

  it('should handle match without matchday', () => {
    const m = { ...matchDetail, matchday: null }
    const result = formatMatches([m as unknown as Match])
    expect(result).toContain('Premier League')
    expect(result).not.toContain('Matchday')
  })

  it('should handle match without teams', () => {
    const m = { ...matchDetail, homeTeam: null, awayTeam: null }
    const result = formatMatches([m as unknown as Match])
    expect(result).toContain('TBD')
  })

  it('should handle match with null score in finished', () => {
    const m = { ...matchDetail, score: { ...matchDetail.score, fullTime: null } }
    const result = formatMatches([m as unknown as Match])
    expect(result).toContain('0 - 0')
  })
})

describe('formatMatch', () => {
  it('should format match detail', () => {
    const result = formatMatch(matchDetail as unknown as Match)
    expect(result).toContain('Premier League')
    expect(result).toContain('Arsenal')
    expect(result).toContain('Everton')
    expect(result).toContain('2')
    expect(result).toContain('1')
    expect(result).toContain('FINISHED')
    expect(result).toContain('Michael Oliver')
    expect(result).toContain('12345')
  })

  it('should show half-time score', () => {
    const result = formatMatch(matchDetail as unknown as Match)
    expect(result).toContain('Half-time')
  })

  it('should format scheduled match detail', () => {
    const scheduled = { ...matchDetail, status: 'SCHEDULED' }
    const result = formatMatch(scheduled as unknown as Match)
    expect(result).toContain('vs')
    expect(result).toContain('SCHEDULED')
  })

  it('should show extra time duration', () => {
    const et = {
      ...matchDetail,
      score: { ...matchDetail.score, duration: 'EXTRA_TIME' },
    }
    const result = formatMatch(et as unknown as Match)
    expect(result).toContain('Duration: EXTRA_TIME')
  })

  it('should not show duration for REGULAR', () => {
    const result = formatMatch(matchDetail as unknown as Match)
    expect(result).not.toContain('Duration:')
  })

  it('should handle match with no referees', () => {
    const noRef = { ...matchDetail, referees: [] }
    const result = formatMatch(noRef as unknown as Match)
    expect(result).not.toContain('Referees:')
  })

  it('should handle match with null halfTime', () => {
    const noHt = {
      ...matchDetail,
      score: { ...matchDetail.score, halfTime: { home: null, away: null } },
    }
    const result = formatMatch(noHt as unknown as Match)
    expect(result).not.toContain('Half-time')
  })

  it('should format IN_PLAY match detail', () => {
    const live = {
      ...matchDetail,
      status: 'IN_PLAY',
      score: {
        ...matchDetail.score,
        fullTime: { home: 2, away: 1 },
        halfTime: { home: 1, away: 0 },
      },
    }
    const result = formatMatch(live as unknown as Match)
    expect(result).toContain('🟢')
    expect(result).toContain('IN_PLAY')
    expect(result).toContain('Half-time: 1 - 0')
  })

  it('should handle missing competition and stage', () => {
    const m = { ...matchDetail, competition: null, stage: null }
    const result = formatMatch(m as unknown as Match)
    expect(result).toContain('Match ID')
  })

  it('should handle match with null fullTime score', () => {
    const m = { ...matchDetail, score: { ...matchDetail.score, fullTime: null } }
    const result = formatMatch(m as unknown as Match)
    expect(result).toContain('0 - 0')
  })

  it('should handle match with no teams', () => {
    const m = { ...matchDetail, homeTeam: null, awayTeam: null }
    const result = formatMatch(m as unknown as Match)
    expect(result).toContain('TBD')
  })
})

describe('formatStandings', () => {
  it('should format standings table', () => {
    const result = formatStandings(standingsPl.standings as unknown as Standing[], 'Premier League')
    expect(result).toContain('Premier League')
    expect(result).toContain('Standings')
    expect(result).toContain('Liverpool')
    expect(result).toContain('Arsenal')
    expect(result).toContain('38')
    expect(result).toContain('34')
  })

  it('should handle missing standings', () => {
    const result = formatStandings([], 'PL')
    expect(result).toBe('No standings available.')
  })

  it('should show position info footer', () => {
    const result = formatStandings(standingsPl.standings as unknown as Standing[])
    expect(result).toContain('UCL Spots')
    expect(result).toContain('Relegation')
  })

  it('should handle negative goal difference', () => {
    const negGd = [
      {
        stage: 'REGULAR_SEASON',
        type: 'TOTAL',
        table: [
          {
            position: 1,
            team: { id: 1, name: 'Test FC', shortName: 'Test', tla: 'TST', crest: '' },
            playedGames: 10,
            won: 2,
            draw: 3,
            lost: 5,
            points: 9,
            goalsFor: 10,
            goalsAgainst: 20,
            goalDifference: -10,
            form: null,
          },
        ],
      },
    ]
    const result = formatStandings(negGd as unknown as Standing[])
    expect(result).toContain('-10')
    expect(result).toContain('Test')
  })

  it('should default to League when no competition name', () => {
    const result = formatStandings(standingsPl.standings as unknown as Standing[])
    expect(result).toContain('League — Standings')
  })

  it('should handle team with only name (no shortName)', () => {
    const data = [
      {
        stage: 'REGULAR_SEASON',
        type: 'TOTAL',
        table: [
          {
            position: 1,
            team: { id: 1, name: 'Long Team Name FC', shortName: null, tla: 'LTN', crest: '' },
            playedGames: 5,
            won: 5,
            draw: 0,
            lost: 0,
            points: 15,
            goalsFor: 12,
            goalsAgainst: 3,
            goalDifference: 9,
            form: 'W,W,W,W,W',
          },
        ],
      },
    ]
    const result = formatStandings(data as unknown as Standing[])
    expect(result).toContain('Long Team Name FC')
    expect(result).toContain('W,W,W,W,W')
  })

  it('should handle standings with non-TOTAL type only', () => {
    const data = [
      {
        stage: 'REGULAR_SEASON',
        type: 'HOME',
        table: [{ position: 1, team: { id: 1, name: 'T', shortName: 'T' } }],
      },
    ]
    const result = formatStandings(data as unknown as Standing[])
    expect(result).toBe('No standings available.')
  })
})

describe('formatTeam', () => {
  it('should format team info', () => {
    const result = formatTeam(teamFixture as unknown as Team)
    expect(result).toContain('Arsenal FC')
    expect(result).toContain('1886')
    expect(result).toContain('Emirates Stadium')
    expect(result).toContain('Mikel Arteta')
    expect(result).toContain('arsenal.com')
  })

  it('should group squad by position', () => {
    const result = formatTeam(teamFixture as unknown as Team)
    expect(result).toContain('GK: David Raya')
    expect(result).toContain('DF: William Saliba')
    expect(result).toContain('MF: Declan Rice')
    expect(result).toContain('FW: Bukayo Saka')
    expect(result).toContain('Squad (4 players)')
  })

  it('should show competitions', () => {
    const result = formatTeam(teamFixture as unknown as Team)
    expect(result).toContain('Premier League')
    expect(result).toContain('Champions League')
  })

  it('should handle team with no squad', () => {
    const noSquad = { ...teamFixture, squad: [] }
    const result = formatTeam(noSquad as unknown as Team)
    expect(result).toContain('Arsenal FC')
    expect(result).not.toContain('Squad')
  })

  it('should handle team with no competitions', () => {
    const noComp = { ...teamFixture, runningCompetitions: [] }
    const result = formatTeam(noComp as unknown as Team)
    expect(result).not.toContain('Competitions:')
  })

  it('should handle player with null position', () => {
    const team = {
      ...teamFixture,
      squad: [
        {
          id: 1,
          name: 'Unknown Player',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          nationality: '',
          position: null,
          shirtNumber: null,
        },
      ],
    }
    const result = formatTeam(team as unknown as Team)
    expect(result).toContain('Other: Unknown Player')
  })
})

describe('formatTeamMatches', () => {
  it('should format team matches', () => {
    const result = formatTeamMatches([matchDetail as unknown as Match])
    expect(result).toContain('Arsenal')
  })

  it('should handle empty', () => {
    const result = formatTeamMatches([], 'Arsenal')
    expect(result).toContain('No matches found for Arsenal')
  })

  it('should handle empty without teamName', () => {
    const result = formatTeamMatches([])
    expect(result).toContain('No matches found')
    expect(result).not.toContain('for')
  })
})

describe('formatPlayer', () => {
  it('should format player info', () => {
    const player: Player = {
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
    const result = formatPlayer(player)
    expect(result).toContain('Bukayo Saka')
    expect(result).toContain('England')
    expect(result).toContain('Offence')
    expect(result).toContain('7')
    expect(result).toContain('Arsenal FC')
  })

  it('should handle missing data', () => {
    const player: Player = {
      id: 1,
      name: 'Test',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      position: null,
      shirtNumber: null,
    }
    const result = formatPlayer(player)
    expect(result).toContain('Test')
    expect(result).not.toContain('Shirt Number')
  })

  it('should handle player without currentTeam', () => {
    const player: Player = {
      id: 2,
      name: 'Free Agent',
      firstName: '',
      lastName: '',
      dateOfBirth: null as unknown as string,
      nationality: null as unknown as string,
      position: null,
      shirtNumber: null,
    }
    const result = formatPlayer(player)
    expect(result).toContain('Free Agent')
    expect(result).toContain('N/A')
    expect(result).not.toContain('Current Team')
  })
})

describe('formatScorers', () => {
  it('should format scorers table', () => {
    const scorers: Scorer[] = [
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
    ]
    const result = formatScorers(scorers, 'Premier League')
    expect(result).toContain('Premier League')
    expect(result).toContain('Top Scorers')
    expect(result).toContain('M. Salah')
    expect(result).toContain('Liverpool')
    expect(result).toContain('14')
  })

  it('should handle empty list', () => {
    expect(formatScorers([])).toBe('No scorers found.')
  })

  it('should use default competition name when not provided', () => {
    const scorers: Scorer[] = [
      {
        player: {
          id: 1,
          name: 'Player',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          nationality: '',
          position: null,
          shirtNumber: null,
        },
        team: { id: 1, name: 'Team FC', shortName: null as unknown as string, tla: '', crest: '' },
        playedMatches: 5,
        goals: 3,
        assists: null as unknown as number,
        penalties: null as unknown as number,
      },
    ]
    const result = formatScorers(scorers)
    expect(result).toContain('Competition')
    expect(result).toContain('Team FC')
  })
})
