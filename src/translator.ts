import { PoParser } from "./parser";
import { createProvider } from "./providers";
import { RateLimiter } from "./rate-limiter";
import type {
  TranslationConfig,
  TranslationProgress,
  PoFile,
  TranslationEntry,
  LLMProvider,
  RateLimitError,
} from "./types";

export class Translator {
  private provider: LLMProvider;
  private config: TranslationConfig;
  private progress: TranslationProgress;
  private rateLimiter: RateLimiter;
  private poFile: PoFile;
  private outputPath: string;

  constructor(config: TranslationConfig) {
    this.config = config;
    this.provider = createProvider(
      config.provider,
      config.apiKey,
      config.model
    );
    this.progress = {
      total: 0,
      completed: 0,
      failed: 0,
      rateLimitHits: 0,
      averageDelay: config.delay || 1000,
    };
    this.rateLimiter = new RateLimiter(config);
    this.poFile = undefined as any;
    this.outputPath = "";
  }

  async translateFile(inputPath: string, outputPath: string): Promise<void> {
    console.log(`🔄 Loading file: ${inputPath}`);

    // Read and parse the .po file
    const file = Bun.file(inputPath);
    const content = await file.text();
    this.poFile = PoParser.parse(content);
    this.outputPath = outputPath;

    // Filter entries that need translation
    const entriesToTranslate = this.poFile.entries.filter((entry) => {
      // Skip empty msgid or already translated entries
      if (!entry.msgid || entry.msgid === "") return false;

      // Check if already translated (not empty and different from msgid)
      if (entry.msgstr && entry.msgstr !== "" && entry.msgstr !== entry.msgid) {
        return false;
      }

      return true;
    });

    this.progress.total = entriesToTranslate.length;

    console.log(`📊 Found ${this.progress.total} entries to translate`);
    console.log(`🌍 Target language: ${this.config.targetLanguage}`);
    console.log(`🤖 Using provider: ${this.provider.name}`);
    console.log(
      `🚦 Rate limiting: ${
        this.rateLimiter.getStats().maxConcurrentRequests
      } concurrent, ${this.rateLimiter.getStats().currentDelay}ms delay`
    );

    if (this.progress.total === 0) {
      console.log("✅ No entries need translation");
      return;
    }

    // Translate in batches with rate limiting
    const batchSize = this.config.batchSize || 10;

    for (let i = 0; i < entriesToTranslate.length; i += batchSize) {
      const batch = entriesToTranslate.slice(i, i + batchSize);

      await this.translateBatch(batch);

      // Show rate limiter stats periodically
      if (i % (batchSize * 5) === 0) {
        const stats = this.rateLimiter.getStats();
        console.log(
          `\n📊 Rate limiter stats: ${stats.requestsLastMinute} requests/min, ${stats.activeRequests} active, ${stats.currentDelay}ms delay`
        );
      }
    }

    // Save translated file
    const translatedContent = PoParser.serialize(this.poFile);
    await Bun.write(this.outputPath, translatedContent);

    console.log(`\n✅ Translation completed!`);
    console.log(`📄 Output saved to: ${this.outputPath}`);
    console.log(`📈 Statistics:`);
    console.log(`   - Total entries: ${this.progress.total}`);
    console.log(`   - Successfully translated: ${this.progress.completed}`);
    console.log(`   - Failed: ${this.progress.failed}`);
    console.log(`   - Rate limit hits: ${this.progress.rateLimitHits || 0}`);
    console.log(`   - Average delay: ${this.progress.averageDelay}ms`);

    const stats = this.rateLimiter.getStats();
    console.log(`📊 Final rate limiter stats:`);
    console.log(`   - Requests last minute: ${stats.requestsLastMinute}`);
    console.log(`   - Final delay: ${stats.currentDelay}ms`);
  }

  private async translateBatch(entries: TranslationEntry[]): Promise<void> {
    const promises = entries.map((entry) => this.translateEntry(entry));
    await Promise.allSettled(promises);
  }

  private async translateEntry(entry: TranslationEntry): Promise<void> {
    const maxRetries = this.config.maxRetries || 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        this.progress.current = entry.msgid;
        this.printProgress();

        // Acquire rate limiting token
        await this.rateLimiter.acquireToken();

        try {
          // Create context from comments
          const context = entry.comments?.join(" ") || "";

          // Translate
          const translatedText = await this.provider.translate(
            entry.msgid,
            this.config.targetLanguage,
            context
          );

          // Update entry
          entry.msgstr = translatedText;

          this.progress.completed++;
          this.rateLimiter.handleSuccess();
          this.printProgress();

          // Save partial progress after each successful translation
          try {
            // Serialize and save the updated .po file
            const translatedContent = PoParser.serialize(this.poFile);
            await Bun.write(this.outputPath, translatedContent);
          } catch (e) {
            console.error("⚠️ Error saving partial progress:", e);
          }

          return;
        } finally {
          // Always release the token
          this.rateLimiter.releaseToken();
        }
      } catch (error) {
        this.rateLimiter.releaseToken();

        // Handle rate limit errors specifically
        const isRateLimit = this.rateLimiter.handleRateLimit(error);
        if (isRateLimit) {
          this.progress.rateLimitHits = (this.progress.rateLimitHits || 0) + 1;

          // For rate limit errors, wait longer before retrying
          const rateLimitError = error as RateLimitError;
          const waitTime =
            rateLimitError.retryAfter || 5000 * Math.pow(2, retries);

          console.error(`\n🚦 Rate limit hit for: "${entry.msgid}"`);
          console.error(`   Waiting ${waitTime}ms before retry...`);

          await this.sleep(waitTime);
          retries++;
          continue;
        }

        retries++;
        console.error(`\n❌ Translation failed for: "${entry.msgid}"`);
        console.error(
          `   Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );

        if (retries < maxRetries) {
          console.log(`   Retrying... (${retries}/${maxRetries})`);
          await this.sleep(2000 * retries); // Exponential backoff
        } else {
          console.error(`   Max retries reached. Skipping this entry.`);
          entry.msgstr = entry.msgid; // Fallback to original text
          this.progress.failed++;
          // Salvar progresso parcial mesmo em caso de falha definitiva
          try {
            const translatedContent = PoParser.serialize(this.poFile);
            await Bun.write(this.outputPath, translatedContent);
          } catch (e) {
            console.error("⚠️ Erro ao salvar progresso parcial:", e);
          }
          return;
        }
      }
    }
  }

  private printProgress(): void {
    const percent = Math.round(
      (this.progress.completed / this.progress.total) * 100
    );
    const bar =
      "█".repeat(Math.floor(percent / 5)) +
      "░".repeat(20 - Math.floor(percent / 5));

    process.stdout.write(
      `\r🔄 [${bar}] ${percent}% (${this.progress.completed}/${this.progress.total})`
    );

    if (this.progress.current) {
      const truncated =
        this.progress.current.length > 50
          ? this.progress.current.substring(0, 47) + "..."
          : this.progress.current;
      process.stdout.write(` - ${truncated}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export async function translatePoFile(
  config: TranslationConfig,
  inputPath: string,
  outputPath: string
): Promise<void> {
  const translator = new Translator(config);
  await translator.translateFile(inputPath, outputPath);
}
