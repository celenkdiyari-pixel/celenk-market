// Simple in-memory rate limiter
// In production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitConfig {
  maxAttempts: number; // Maximum number of attempts
  windowMs: number; // Time window in milliseconds
  blockDurationMs?: number; // Optional: block duration after max attempts exceeded
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked?: boolean;
  message?: string;
}

/**
 * Check rate limit for a given identifier (IP address, user ID, etc.)
 * @param identifier - Unique identifier for rate limiting (e.g., IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.blockedUntil,
      blocked: true,
      message: `Çok fazla deneme yapıldı. Lütfen ${Math.ceil((entry.blockedUntil - now) / 1000 / 60)} dakika sonra tekrar deneyin.`
    };
  }

  // Reset if window expired
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(identifier, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: newEntry.resetTime
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxAttempts) {
    // Block if block duration is configured
    if (config.blockDurationMs) {
      entry.blockedUntil = now + config.blockDurationMs;
      entry.count = 0; // Reset count for next window
      rateLimitStore.set(identifier, entry);
    }
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      blocked: !!config.blockDurationMs,
      message: config.blockDurationMs
        ? `Çok fazla deneme yapıldı. Lütfen ${Math.ceil(config.blockDurationMs / 1000 / 60)} dakika sonra tekrar deneyin.`
        : 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.'
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.resetTime
  };
}

/**
 * Reset rate limit for a given identifier (e.g., on successful login)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  const clientIP = forwarded?.split(',')[0] || realIP || 'unknown';
  return clientIP.trim();
}

