import { z } from 'zod'

const configSchema = z.object({
  apiKey: z.string().min(1, 'FOOTBALL_MCP_API_KEY is required'),
  baseUrl: z.string().url().default('https://api.football-data.org/v4'),
  cacheTtlMs: z.number().int().positive().default(60000),
  standingsTtlMs: z.number().int().positive().default(300000),
  cacheMaxSize: z.number().int().positive().default(100),
  timeoutMs: z.number().int().positive().default(10000),
  rateLimit: z.number().int().positive().default(10),
})

export type FootballConfig = z.infer<typeof configSchema>

export function loadConfig(): FootballConfig {
  return configSchema.parse({
    apiKey: process.env.FOOTBALL_MCP_API_KEY ?? '',
    baseUrl: process.env.FOOTBALL_MCP_BASE_URL ?? 'https://api.football-data.org/v4',
    cacheTtlMs: parseInt(process.env.FOOTBALL_MCP_CACHE_TTL_MS ?? '60000', 10),
    standingsTtlMs: parseInt(process.env.FOOTBALL_MCP_STANDINGS_TTL_MS ?? '300000', 10),
    cacheMaxSize: parseInt(process.env.FOOTBALL_MCP_CACHE_MAX_SIZE ?? '100', 10),
    timeoutMs: parseInt(process.env.FOOTBALL_MCP_TIMEOUT_MS ?? '10000', 10),
    rateLimit: parseInt(process.env.FOOTBALL_MCP_RATE_LIMIT ?? '10', 10),
  })
}
