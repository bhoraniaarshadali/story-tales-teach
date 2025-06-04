
// Client-side rate limiting for basic protection
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class ClientRateLimiter {
  private store: RateLimitStore = {};
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.store[identifier];

    if (!record || now > record.resetTime) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.store[identifier];
    if (!record) return 0;
    
    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }

  reset(identifier: string): void {
    delete this.store[identifier];
  }
}

// Export singleton instances for different actions
export const loginRateLimiter = new ClientRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const signupRateLimiter = new ClientRateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour
export const resetPasswordRateLimiter = new ClientRateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour
