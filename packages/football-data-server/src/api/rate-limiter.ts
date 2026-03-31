export class TokenBucketRateLimiter {
  private tokens: number
  private readonly maxTokens: number
  private readonly refillIntervalMs: number
  private lastRefill: number

  constructor(maxTokens: number, refillIntervalMs: number) {
    this.maxTokens = maxTokens
    this.tokens = maxTokens
    this.refillIntervalMs = refillIntervalMs
    this.lastRefill = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    const tokensToAdd = Math.floor(elapsed / (this.refillIntervalMs / this.maxTokens))
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
      this.lastRefill = now
    }
  }

  tryAcquire(): boolean {
    this.refill()
    if (this.tokens > 0) {
      this.tokens--
      return true
    }
    return false
  }

  async acquire(): Promise<void> {
    while (!this.tryAcquire()) {
      const waitMs = Math.ceil(this.refillIntervalMs / this.maxTokens)
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }
  }

  getAvailableTokens(): number {
    this.refill()
    return this.tokens
  }
}
