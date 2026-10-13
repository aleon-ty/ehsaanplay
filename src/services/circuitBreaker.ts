/**
 * Circuit Breaker implementation for OMDb API Provider
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownPeriodMs: number;
  requestTimeoutMs: number;
}

export class CircuitBreaker {
  public readonly name: string;
  private state: CircuitState = 'CLOSED';
  private consecutiveFailures = 0;
  private nextAttemptTimestamp = 0;
  private rateLimitResetTimestamp = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
    this.name = name;
    this.config = {
      failureThreshold: config?.failureThreshold ?? 3,
      cooldownPeriodMs: config?.cooldownPeriodMs ?? 30000,
      requestTimeoutMs: config?.requestTimeoutMs ?? 5000,
    };
  }

  public getState(): CircuitState {
    const now = Date.now();
    if (this.state === 'OPEN') {
      const waitUntil = Math.max(this.nextAttemptTimestamp, this.rateLimitResetTimestamp);
      if (now >= waitUntil) {
        this.state = 'HALF_OPEN';
        return 'HALF_OPEN';
      }
    }
    return this.state;
  }

  public isAvailable(): boolean {
    const state = this.getState();
    return state === 'CLOSED' || state === 'HALF_OPEN';
  }

  public getStatusMessage(): { state: CircuitState; message: string; remainingCooldownSec?: number } {
    const state = this.getState();
    const now = Date.now();
    if (state === 'OPEN') {
      const waitUntil = Math.max(this.nextAttemptTimestamp, this.rateLimitResetTimestamp);
      const remainingSec = Math.max(0, Math.ceil((waitUntil - now) / 1000));
      const reason = this.rateLimitResetTimestamp > now ? 'Rate Limited (HTTP 429)' : 'Repeated Failures';
      return {
        state: 'OPEN',
        message: `Circuit OPEN (${reason}). Paused for ${remainingSec}s`,
        remainingCooldownSec: remainingSec,
      };
    }
    if (state === 'HALF_OPEN') {
      return {
        state: 'HALF_OPEN',
        message: 'Circuit HALF-OPEN (Testing provider recovery)',
      };
    }
    return {
      state: 'CLOSED',
      message: 'Circuit CLOSED (Healthy & Operational)',
    };
  }

  public recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = 'CLOSED';
    this.rateLimitResetTimestamp = 0;
  }

  public recordFailure(isRateLimit = false, retryAfterSeconds?: number): void {
    const now = Date.now();
    this.consecutiveFailures += 1;

    if (isRateLimit) {
      const cooldownMs = (retryAfterSeconds && retryAfterSeconds > 0 ? retryAfterSeconds : 30) * 1000;
      this.rateLimitResetTimestamp = now + cooldownMs;
      this.state = 'OPEN';
      return;
    }

    if (this.state === 'HALF_OPEN' || this.consecutiveFailures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTimestamp = now + this.config.cooldownPeriodMs;
    }
  }

  public reset(): void {
    this.state = 'CLOSED';
    this.consecutiveFailures = 0;
    this.nextAttemptTimestamp = 0;
    this.rateLimitResetTimestamp = 0;
  }

  public get timeoutMs(): number {
    return this.config.requestTimeoutMs;
  }
}

// Global instance for TMDB provider
export const tmdbCircuitBreaker = new CircuitBreaker('TMDB', {
  failureThreshold: 4,
  cooldownPeriodMs: 15000,
  requestTimeoutMs: 8500,
});

// Global instance for OMDb provider
export const omdbCircuitBreaker = new CircuitBreaker('OMDb', {
  failureThreshold: 4,
  cooldownPeriodMs: 15000,
  requestTimeoutMs: 8500,
});
