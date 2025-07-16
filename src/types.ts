export interface TranslationEntry {
  msgid: string;
  msgstr: string;
  comments?: string[];
  context?: string;
  line?: number;
}

export interface PoFile {
  header: {
    language: string;
    pluralForms?: string;
    charset?: string;
    [key: string]: any;
  };
  entries: TranslationEntry[];
}

export interface LLMProvider {
  name: string;
  translate(
    text: string,
    targetLanguage: string,
    context?: string
  ): Promise<string>;
}

export interface TranslationConfig {
  provider: "openai" | "anthropic" | "gemini";
  apiKey: string;
  model?: string;
  targetLanguage: string;
  batchSize?: number;
  delay?: number;
  maxRetries?: number;
  // New rate limiting options
  requestsPerMinute?: number;
  requestsPerSecond?: number;
  maxConcurrentRequests?: number;
  adaptiveRateLimit?: boolean;
}

export interface TranslationProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
  // New rate limiting statistics
  rateLimitHits?: number;
  averageDelay?: number;
}

export interface RateLimitError extends Error {
  retryAfter?: number;
  isRateLimit: true;
}
