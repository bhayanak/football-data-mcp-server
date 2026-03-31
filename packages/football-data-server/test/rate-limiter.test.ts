import { describe, it, expect } from 'vitest'
import { TokenBucketRateLimiter } from '../src/api/rate-limiter.js'

describe('TokenBucketRateLimiter', () => {
  it('should allow requests up to the limit', () => {
    const limiter = new TokenBucketRateLimiter(3, 60000)
    expect(limiter.tryAcquire()).toBe(true)
    expect(limiter.tryAcquire()).toBe(true)
    expect(limiter.tryAcquire()).toBe(true)
    expect(limiter.tryAcquire()).toBe(false)
  })

  it('should report available tokens', () => {
    const limiter = new TokenBucketRateLimiter(5, 60000)
    expect(limiter.getAvailableTokens()).toBe(5)
    limiter.tryAcquire()
    expect(limiter.getAvailableTokens()).toBe(4)
  })

  it('should refill tokens over time', async () => {
    const limiter = new TokenBucketRateLimiter(2, 200)
    limiter.tryAcquire()
    limiter.tryAcquire()
    expect(limiter.tryAcquire()).toBe(false)

    // Wait for refill
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(limiter.getAvailableTokens()).toBeGreaterThanOrEqual(1)
  })

  it('should acquire asynchronously when tokens exhausted', async () => {
    const limiter = new TokenBucketRateLimiter(1, 200)
    limiter.tryAcquire()
    expect(limiter.tryAcquire()).toBe(false)

    // acquire() should wait and resolve
    await limiter.acquire()
    // If we reach here, the acquire succeeded
    expect(true).toBe(true)
  })
})
