import type { TranslationConfig } from "./types";

export interface RateLimitOptions {
  requestsPerMinute?: number;
  requestsPerSecond?: number;
  maxConcurrentRequests?: number;
}

export class RateLimiter {
  private requestTimes: number[] = [];
  private activeRequests = 0;
  private requestsPerMinute: number;
  private requestsPerSecond: number;
  private maxConcurrentRequests: number;
  private adaptiveMode: boolean;
  private baseDelay: number;
  private currentDelay: number;

  constructor(config: TranslationConfig) {
    // Default rate limits based on provider
    const defaultLimits = this.getDefaultLimits(config.provider);
    
    this.requestsPerMinute = config.requestsPerMinute ?? defaultLimits.requestsPerMinute ?? 1000;
    this.requestsPerSecond = config.requestsPerSecond ?? defaultLimits.requestsPerSecond ?? 10;
    this.maxConcurrentRequests = config.maxConcurrentRequests ?? defaultLimits.maxConcurrentRequests ?? 3;
    this.adaptiveMode = config.adaptiveRateLimit || true;
    this.baseDelay = config.delay || 1000;
    this.currentDelay = this.baseDelay;
  }

  private getDefaultLimits(provider: string): RateLimitOptions {
    switch (provider.toLowerCase()) {
      case "openai":
        return {
          requestsPerMinute: 3500, // Conservative limit for most tiers
          requestsPerSecond: 60,
          maxConcurrentRequests: 10,
        };
      case "anthropic":
        return {
          requestsPerMinute: 4000,
          requestsPerSecond: 50,
          maxConcurrentRequests: 5,
        };
      case "gemini":
        return {
          requestsPerMinute: 1500,
          requestsPerSecond: 15,
          maxConcurrentRequests: 5,
        };
      default:
        return {
          requestsPerMinute: 1000,
          requestsPerSecond: 10,
          maxConcurrentRequests: 3,
        };
    }
  }

  async acquireToken(): Promise<void> {
    // Wait for available concurrent slot
    while (this.activeRequests >= this.maxConcurrentRequests) {
      await this.sleep(100);
    }

    // Check rate limits
    const now = Date.now();
    
    // Clean old requests (older than 1 minute)
    this.requestTimes = this.requestTimes.filter(time => now - time < 60000);
    
    // Check per-minute limit
    if (this.requestTimes.length >= this.requestsPerMinute) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = 60000 - (now - oldestRequest);
      await this.sleep(waitTime);
    }
    
    // Check per-second limit
    const recentRequests = this.requestTimes.filter(time => now - time < 1000);
    if (recentRequests.length >= this.requestsPerSecond) {
      const oldestRecentRequest = recentRequests[0];
      const waitTime = 1000 - (now - oldestRecentRequest);
      await this.sleep(waitTime);
    }

    // Apply current delay
    if (this.currentDelay > 0) {
      await this.sleep(this.currentDelay);
    }

    // Acquire the token
    this.activeRequests++;
    this.requestTimes.push(Date.now());
  }

  releaseToken(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  handleRateLimit(error: any): boolean {
    const isRateLimit = this.isRateLimitError(error);
    
    if (isRateLimit && this.adaptiveMode) {
      // Increase delay exponentially
      this.currentDelay = Math.min(this.currentDelay * 2, 30000); // Max 30 seconds
      
      // Reduce concurrent requests
      this.maxConcurrentRequests = Math.max(1, Math.floor(this.maxConcurrentRequests * 0.8));
      
      console.log(`🚦 Rate limit detected! Adjusting limits:`);
      console.log(`   - Delay increased to: ${this.currentDelay}ms`);
      console.log(`   - Max concurrent requests: ${this.maxConcurrentRequests}`);
    }
    
    return isRateLimit;
  }

  handleSuccess(): void {
    if (this.adaptiveMode && this.currentDelay > this.baseDelay) {
      // Gradually reduce delay on success
      this.currentDelay = Math.max(this.baseDelay, this.currentDelay * 0.95);
    }
  }

  private isRateLimitError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || error.status || 0;
    
    return (
      errorCode === 429 ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("quota exceeded") ||
      errorMessage.includes("throttled")
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats(): {
    currentDelay: number;
    activeRequests: number;
    maxConcurrentRequests: number;
    requestsLastMinute: number;
  } {
    const now = Date.now();
    const requestsLastMinute = this.requestTimes.filter(time => now - time < 60000).length;
    
    return {
      currentDelay: this.currentDelay,
      activeRequests: this.activeRequests,
      maxConcurrentRequests: this.maxConcurrentRequests,
      requestsLastMinute,
    };
  }
}
