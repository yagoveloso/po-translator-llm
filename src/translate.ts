#!/usr/bin/env bun

/**
 * Script to translate .po files using LLMs
 *
 * Usage examples:
 *
 * 1. Interactive mode:
 *    bun run src/translate.ts interactive
 *
 * 2. Command mode with OpenAI:
 *    bun run src/translate.ts translate -i web.po -o web_pt.po -p openai -k sk-... -l "Portuguese (Brazil)"
 *
 * 3. Quick translation (using environment variables):
 *    OPENAI_API_KEY=sk-... bun run src/translate.ts translate
 *
 * Supported environment variables:
 * - OPENAI_API_KEY
 * - ANTHROPIC_API_KEY
 * - GEMINI_API_KEY
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { translatePoFile } from "./translator";
import type { TranslationConfig } from "./types";

// Default configuration
const DEFAULT_CONFIG = {
  inputPath: "web.po",
  outputPath: "web_translated.po",
  provider: "openai" as const,
  targetLanguage: "Portuguese (Brazil)",
  batchSize: 10,
  delay: 1000,
  maxRetries: 3,
};

// Function to parse command line arguments
function parseArgs(): any {
  const args = process.argv.slice(2);
  const options: any = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "interactive") {
      options.interactive = true;
    } else if (arg === "translate") {
      options.command = "translate";
    } else if (arg === "-i" || arg === "--input") {
      options.input = args[++i];
    } else if (arg === "-o" || arg === "--output") {
      options.output = args[++i];
    } else if (arg === "-p" || arg === "--provider") {
      options.provider = args[++i];
    } else if (arg === "-k" || arg === "--api-key") {
      options.apiKey = args[++i];
    } else if (arg === "-m" || arg === "--model") {
      options.model = args[++i];
    } else if (arg === "-l" || arg === "--language") {
      options.language = args[++i];
    } else if (arg === "-b" || arg === "--batch-size") {
      options.batchSize = parseInt(args[++i]);
    } else if (arg === "-d" || arg === "--delay") {
      options.delay = parseInt(args[++i]);
    } else if (arg === "-r" || arg === "--max-retries") {
      options.maxRetries = parseInt(args[++i]);
    } else if (arg === "--requests-per-minute") {
      options.requestsPerMinute = parseInt(args[++i]);
    } else if (arg === "--requests-per-second") {
      options.requestsPerSecond = parseInt(args[++i]);
    } else if (arg === "--max-concurrent") {
      options.maxConcurrentRequests = parseInt(args[++i]);
    } else if (arg === "--no-adaptive-rate-limit") {
      options.adaptiveRateLimit = false;
    } else if (arg === "-h" || arg === "--help") {
      showHelp();
      process.exit(0);
    }
  }

  return options;
}

// Function to show help
function showHelp() {
  console.log(`
🔄 PO file translator using LLMs

Usage:
  bun run src/translate.ts [command] [options]

Commands:
  translate    Translate a .po file
  interactive  Interactive mode to configure translation

Options:
  -i, --input <path>        Path to input .po file (default: web.po)
  -o, --output <path>       Path to output .po file (default: web_translated.po)
  -p, --provider <provider> LLM provider (openai, anthropic, gemini)
  -k, --api-key <key>       Provider API key
  -m, --model <model>       Model to use
  -l, --language <language> Target language (default: Portuguese (Brazil))
  -b, --batch-size <size>   Batch size (default: 10)
  -d, --delay <ms>          Delay between batches in ms (default: 1000)
  -r, --max-retries <n>     Maximum number of retries (default: 3)
  --requests-per-minute <n> Requests per minute limit (default: auto)
  --requests-per-second <n> Requests per second limit (default: auto)
  --max-concurrent <n>      Maximum concurrent requests (default: auto)
  --no-adaptive-rate-limit  Disable automatic rate limiting adjustment
  -h, --help                Show this help

Examples:
  bun run src/translate.ts interactive
  bun run src/translate.ts translate -i web.po -o web_pt.po -p openai -k sk-...
  OPENAI_API_KEY=sk-... bun run src/translate.ts translate

Environment variables:
  OPENAI_API_KEY      OpenAI API key
  ANTHROPIC_API_KEY   Anthropic API key
  GEMINI_API_KEY      Gemini API key
`);
}

// Function to get API key from environment
function getApiKeyFromEnv(provider: string): string | undefined {
  switch (provider.toLowerCase()) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "gemini":
      return process.env.GEMINI_API_KEY;
    default:
      return undefined;
  }
}

// Function to prompt synchronously in terminal
function promptSync(question: string): string {
  process.stdout.write(question);

  // Read user input synchronously
  const input = readFileSync(0, "utf8");
  return input.trim();
}

// Function for simplified interactive mode
async function interactiveMode(): Promise<
  TranslationConfig & { inputPath: string; outputPath: string }
> {
  console.log("🎯 Interactive mode - Translation configurator\n");

  const inputPath =
    promptSync(
      `📂 Caminho do arquivo .po de entrada (${DEFAULT_CONFIG.inputPath}): `
    ) || DEFAULT_CONFIG.inputPath;
  const outputPath =
    promptSync(
      `� Caminho do arquivo .po de saída (${DEFAULT_CONFIG.outputPath}): `
    ) || DEFAULT_CONFIG.outputPath;

  console.log("\n🤖 Escolha o provedor LLM:");
  console.log("1. OpenAI (GPT-4o, GPT-3.5-turbo)");
  console.log("2. Anthropic (Claude)");
  console.log("3. Google Gemini");

  const providerChoice = promptSync("Escolha (1-3): ");
  const providerMap: { [key: string]: string } = {
    "1": "openai",
    "2": "anthropic",
    "3": "gemini",
  };

  const provider = providerMap[providerChoice] || "openai";

  let apiKey = getApiKeyFromEnv(provider);
  if (!apiKey) {
    apiKey = promptSync(`🔑 Chave da API do ${provider}: `);
  }

  const model = promptSync("🎯 Model (optional): ");
  const targetLanguage =
    promptSync(`🌍 Target language (${DEFAULT_CONFIG.targetLanguage}): `) ||
    DEFAULT_CONFIG.targetLanguage;

  const batchSizeInput = promptSync(
    `📦 Batch size (${DEFAULT_CONFIG.batchSize}): `
  );
  const batchSize = batchSizeInput
    ? parseInt(batchSizeInput)
    : DEFAULT_CONFIG.batchSize;

  const delayInput = promptSync(
    `⏱️  Delay between batches in ms (${DEFAULT_CONFIG.delay}): `
  );
  const delay = delayInput ? parseInt(delayInput) : DEFAULT_CONFIG.delay;

  const maxRetriesInput = promptSync(
    `🔄 Maximum number of retries (${DEFAULT_CONFIG.maxRetries}): `
  );
  const maxRetries = maxRetriesInput
    ? parseInt(maxRetriesInput)
    : DEFAULT_CONFIG.maxRetries;

  return {
    inputPath,
    outputPath,
    provider: provider as any,
    apiKey,
    model: model || undefined,
    targetLanguage,
    batchSize,
    delay,
    maxRetries,
  };
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.interactive) {
    console.log(
      "🎯 Interactive mode not implemented in this simplified version."
    );
    console.log("Use command line arguments. Run with -h to see options.");
    return;
  }

  // Check if file exists
  const inputPath = options.input || DEFAULT_CONFIG.inputPath;
  if (!existsSync(inputPath)) {
    console.log(`⚠️  File ${inputPath} not found.`);
    console.log(
      "   Make sure the file exists or use the -i option to specify the path."
    );
    process.exit(1);
  }
  const outputPath = options.output || DEFAULT_CONFIG.outputPath;

  // Get configuration from arguments
  const provider = options.provider || DEFAULT_CONFIG.provider;
  const apiKey = options.apiKey || getApiKeyFromEnv(provider);

  if (!apiKey) {
    console.error(`❌ API key not found for provider ${provider}`);
    console.error(
      "   Use the -k option to provide the key or set the corresponding environment variable."
    );
    process.exit(1);
  }

  const config: TranslationConfig = {
    provider,
    apiKey,
    model: options.model,
    targetLanguage: options.language || DEFAULT_CONFIG.targetLanguage,
    batchSize: options.batchSize || DEFAULT_CONFIG.batchSize,
    delay: options.delay || DEFAULT_CONFIG.delay,
    maxRetries: options.maxRetries || DEFAULT_CONFIG.maxRetries,
    requestsPerMinute: options.requestsPerMinute,
    requestsPerSecond: options.requestsPerSecond,
    maxConcurrentRequests: options.maxConcurrentRequests,
    adaptiveRateLimit: options.adaptiveRateLimit ?? true,
  };

  try {
    console.log("🚀 Starting translation...");
    console.log(`📂 Input: ${inputPath}`);
    console.log(`📂 Output: ${outputPath}`);
    console.log(`🌍 Language: ${config.targetLanguage}`);
    console.log(`🤖 Provider: ${config.provider}`);

    await translatePoFile(config, inputPath, outputPath);

    console.log("\n✅ Translation completed successfully!");
  } catch (error) {
    console.error("❌ Error during translation:");
    console.error(error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}

// Run if this is the main file
main().catch(console.error);
