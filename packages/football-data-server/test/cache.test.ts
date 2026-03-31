import { describe, it, expect } from 'vitest'
import { LRUCache } from '../src/api/cache.js'

describe('LRUCache', () => {
  it('should store and retrieve values', () => {
    const cache = new LRUCache(10, 60000)
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should return undefined for missing keys', () => {
    const cache = new LRUCache(10, 60000)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('should expire entries after TTL', async () => {
    const cache = new LRUCache(10, 50)
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')

    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(cache.get('key1')).toBeUndefined()
  })

  it('should respect custom TTL per entry', async () => {
    const cache = new LRUCache(10, 5000)
    cache.set('short', 'val', 50)
    cache.set('long', 'val2', 5000)

    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(cache.get('short')).toBeUndefined()
    expect(cache.get('long')).toBe('val2')
  })

  it('should evict the oldest entry when at capacity', () => {
    const cache = new LRUCache(2, 60000)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3) // evicts 'a'

    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
    expect(cache.get('c')).toBe(3)
  })

  it('should move accessed items to end (LRU)', () => {
    const cache = new LRUCache(2, 60000)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a') // access 'a', makes 'b' the oldest
    cache.set('c', 3) // evicts 'b'

    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('c')).toBe(3)
  })

  it('should track size correctly', () => {
    const cache = new LRUCache(10, 60000)
    expect(cache.size).toBe(0)
    cache.set('a', 1)
    expect(cache.size).toBe(1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
  })

  it('should clear all entries', () => {
    const cache = new LRUCache(10, 60000)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('a')).toBeUndefined()
  })

  it('should report has correctly', () => {
    const cache = new LRUCache(10, 60000)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })
})
