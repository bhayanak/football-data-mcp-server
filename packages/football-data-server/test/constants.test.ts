import { describe, it, expect } from 'vitest'
import { COMPETITION_CODES } from '../src/utils/constants.js'

describe('COMPETITION_CODES', () => {
  it('should contain major league codes', () => {
    expect(COMPETITION_CODES.PL).toBe('Premier League')
    expect(COMPETITION_CODES.PD).toBe('La Liga')
    expect(COMPETITION_CODES.BL1).toBe('Bundesliga')
    expect(COMPETITION_CODES.SA).toBe('Serie A')
    expect(COMPETITION_CODES.FL1).toBe('Ligue 1')
    expect(COMPETITION_CODES.CL).toBe('Champions League')
  })

  it('should contain all expected codes', () => {
    const codes = Object.keys(COMPETITION_CODES)
    expect(codes.length).toBeGreaterThanOrEqual(10)
    expect(codes).toContain('WC')
    expect(codes).toContain('EC')
    expect(codes).toContain('ELC')
    expect(codes).toContain('PPL')
    expect(codes).toContain('DED')
    expect(codes).toContain('BSA')
    expect(codes).toContain('CLI')
  })
})
