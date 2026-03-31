export interface Area {
  id: number
  name: string
  code: string
  flag: string
}

export interface Season {
  id: number
  startDate: string
  endDate: string
  currentMatchday: number
  winner: TeamRef | null
}

export interface Competition {
  id: number
  name: string
  code: string
  type: 'LEAGUE' | 'CUP'
  emblem: string
  area: Area
  currentSeason: Season
  numberOfAvailableSeasons: number
}

export interface TeamRef {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'SUSPENDED'

export interface Score {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT'
  fullTime: { home: number | null; away: number | null }
  halfTime: { home: number | null; away: number | null }
}

export interface Referee {
  id: number
  name: string
  type: string
  nationality: string
}

export interface Match {
  id: number
  competition: Competition
  season: Season
  utcDate: string
  status: MatchStatus
  matchday: number
  stage: string
  homeTeam: TeamRef
  awayTeam: TeamRef
  score: Score
  referees: Referee[]
}

export interface StandingEntry {
  position: number
  team: TeamRef
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  form: string | null
}

export interface Standing {
  stage: string
  type: 'TOTAL' | 'HOME' | 'AWAY'
  table: StandingEntry[]
}

export interface Coach {
  id: number
  name: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
}

export interface Player {
  id: number
  name: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  position: 'Goalkeeper' | 'Defence' | 'Midfield' | 'Offence' | null
  shirtNumber: number | null
  currentTeam?: TeamRef
}

export interface Team {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  address: string
  website: string
  founded: number
  venue: string
  coach: Coach
  squad: Player[]
  runningCompetitions: Competition[]
}

export interface Scorer {
  player: Player
  team: TeamRef
  playedMatches: number
  goals: number
  assists: number
  penalties: number
}

export interface CompetitionsResponse {
  count: number
  competitions: Competition[]
}

export interface MatchesResponse {
  resultSet: { count: number }
  matches: Match[]
}

export interface StandingsResponse {
  competition: Competition
  season: Season
  standings: Standing[]
}

export interface ScorersResponse {
  competition: Competition
  season: Season
  scorers: Scorer[]
}

export interface MatchQuery {
  competition?: string
  dateFrom?: string
  dateTo?: string
  status?: MatchStatus
  matchday?: number
  limit?: number
}
