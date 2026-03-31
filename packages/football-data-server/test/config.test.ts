import { describe, it, expect } from 'vitest'
import { loadConfig } from '../src/config.js'

describe('loadConfig', () => {
  it('should throw when FOOTBALL_MCP_API_KEY is missing', () => {
    const original = process.env.FOOTBALL_MCP_API_KEY
    delete process.env.FOOTBALL_MCP_API_KEY
    expect(() => loadConfig()).toThrow()
    if (original) process.env.FOOTBALL_MCP_API_KEY = original
  })

  it('should return default values with valid API key', () => {
    const original = process.env.FOOTBALL_MCP_API_KEY
    process.env.FOOTBALL_MCP_API_KEY = 'test-key-123'

    const config = loadConfig()
    expect(config.apiKey).toBe('test-key-123')
    expect(config.baseUrl).toBe('https://api.football-data.org/v4')
    expect(config.cacheTtlMs).toBe(60000)
    expect(config.standingsTtlMs).toBe(300000)
    expect(config.cacheMaxSize).toBe(100)
    expect(config.timeoutMs).toBe(10000)
    expect(config.rateLimit).toBe(10)

    if (original) {
      process.env.FOOTBALL_MCP_API_KEY = original
    } else {
      delete process.env.FOOTBALL_MCP_API_KEY
    }
  })

  it('should read custom values from env', () => {
    const originals: Record<string, string | undefined> = {}
    const envVars: Record<string, string> = {
      FOOTBALL_MCP_API_KEY: 'custom-key',
      FOOTBALL_MCP_BASE_URL: 'https://custom.api.com/v4',
      FOOTBALL_MCP_CACHE_TTL_MS: '30000',
      FOOTBALL_MCP_STANDINGS_TTL_MS: '120000',
      FOOTBALL_MCP_CACHE_MAX_SIZE: '50',
      FOOTBALL_MCP_TIMEOUT_MS: '5000',
      FOOTBALL_MCP_RATE_LIMIT: '5',
    }

    for (const [key, val] of Object.entries(envVars)) {
      originals[key] = process.env[key]
      process.env[key] = val
    }

    const config = loadConfig()
    expect(config.apiKey).toBe('custom-key')
    expect(config.baseUrl).toBe('https://custom.api.com/v4')
    expect(config.cacheTtlMs).toBe(30000)
    expect(config.standingsTtlMs).toBe(120000)
    expect(config.cacheMaxSize).toBe(50)
    expect(config.timeoutMs).toBe(5000)
    expect(config.rateLimit).toBe(5)

    for (const [key, val] of Object.entries(originals)) {
      if (val === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = val
      }
    }
  })
})
