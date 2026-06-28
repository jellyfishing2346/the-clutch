// Simple in-memory rate limiter
// Note: This is not suitable for distributed deployments (multiple server instances)
// For production, consider using Upstash Redis or a similar distributed cache

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(identifier)
  }

  const currentEntry = rateLimitStore.get(identifier) || {
    count: 0,
    resetTime: now + windowMs,
  }

  if (currentEntry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: currentEntry.resetTime,
    }
  }

  currentEntry.count++
  rateLimitStore.set(identifier, currentEntry)

  return {
    success: true,
    remaining: limit - currentEntry.count,
    resetTime: currentEntry.resetTime,
  }
}

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute
