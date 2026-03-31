import type { FootballConfig } from '../config.js'
import type {
  Competition,
  CompetitionsResponse,
  Match,
  MatchesResponse,
  MatchQuery,
  Player,
  Scorer,
  ScorersResponse,
  Standing,
  StandingsResponse,
  Team,
} from './types.js'
import { LRUCache } from './cache.js'
import { TokenBucketRateLimiter } from './rate-limiter.js'

export class FootballDataClient {
  private readonly config: FootballConfig
  private readonly cache: LRUCache
  private readonly rateLimiter: TokenBucketRateLimiter

  constructor(config: FootballConfig) {
    this.config = config
    this.cache = new LRUCache(config.cacheMaxSize, config.cacheTtlMs)
    this.rateLimiter = new TokenBucketRateLimiter(config.rateLimit, 60000)
  }

  private async request<T>(path: string, ttlMs?: number): Promise<T> {
    const url = `${this.config.baseUrl}${path}`
    const cached = this.cache.get<T>(url)
    if (cached !== undefined) return cached

    await this.rateLimiter.acquire()

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs)

    try {
      const response = await fetch(url, {
        headers: { 'X-Auth-Token': this.config.apiKey },
        signal: controller.signal,
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.')
        }
        throw new Error(`API error ${response.status}: ${body || response.statusText}`)
      }

      const data = (await response.json()) as T
      this.cache.set(url, data, ttlMs)
      return data
    } finally {
      clearTimeout(timeout)
    }
  }

  async getCompetitions(area?: string): Promise<Competition[]> {
    let path = '/competitions'
    if (area) {
      path += `?areas=${encodeURIComponent(area)}`
    }
    const data = await this.request<CompetitionsResponse>(path)
    return data.competitions
  }

  async getCompetition(code: string): Promise<Competition> {
    return this.request<Competition>(`/competitions/${encodeURIComponent(code)}`)
  }

  async getMatches(params: MatchQuery): Promise<Match[]> {
    const query = new URLSearchParams()
    if (params.dateFrom) query.set('dateFrom', params.dateFrom)
    if (params.dateTo) query.set('dateTo', params.dateTo)
    if (params.status) query.set('status', params.status)
    if (params.matchday) query.set('matchday', String(params.matchday))
    if (params.limit) query.set('limit', String(params.limit))

    const qs = query.toString()
    let path: string
    if (params.competition) {
      path = `/competitions/${encodeURIComponent(params.competition)}/matches`
    } else {
      path = '/matches'
    }
    if (qs) path += `?${qs}`

    const data = await this.request<MatchesResponse>(path)
    return data.matches
  }

  async getMatch(id: number): Promise<Match> {
    return this.request<Match>(`/matches/${id}`)
  }

  async getStandings(competition: string, season?: number, matchday?: number): Promise<Standing[]> {
    let path = `/competitions/${encodeURIComponent(competition)}/standings`
    const query = new URLSearchParams()
    if (season) query.set('season', String(season))
    if (matchday) query.set('matchday', String(matchday))
    const qs = query.toString()
    if (qs) path += `?${qs}`

    const data = await this.request<StandingsResponse>(path, this.config.standingsTtlMs)
    return data.standings
  }

  async getTeam(id: number): Promise<Team> {
    return this.request<Team>(`/teams/${id}`)
  }

  async getTeamMatches(id: number, params?: MatchQuery): Promise<Match[]> {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.dateFrom) query.set('dateFrom', params.dateFrom)
    if (params?.dateTo) query.set('dateTo', params.dateTo)
    if (params?.limit) query.set('limit', String(params.limit))

    let path = `/teams/${id}/matches`
    const qs = query.toString()
    if (qs) path += `?${qs}`

    const data = await this.request<MatchesResponse>(path)
    return data.matches
  }

  async getPlayer(id: number): Promise<Player> {
    return this.request<Player>(`/persons/${id}`)
  }

  async getScorers(competition: string, season?: number, limit?: number): Promise<Scorer[]> {
    const query = new URLSearchParams()
    if (season) query.set('season', String(season))
    if (limit) query.set('limit', String(limit))

    let path = `/competitions/${encodeURIComponent(competition)}/scorers`
    const qs = query.toString()
    if (qs) path += `?${qs}`

    const data = await this.request<ScorersResponse>(path)
    return data.scorers
  }
}
