import OpenAI from "openai";
import type { LLMProvider, RateLimitError } from "./types";

export class OpenAIProvider implements LLMProvider {
  name = "OpenAI";
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4.1-nano") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async translate(
    text: string,
    targetLanguage: string,
    context?: string
  ): Promise<string> {
    const systemPrompt = `You are a professional translator specializing in software localization. 
Your task is to translate user interface strings while preserving:
- HTML tags and markup
- Variable placeholders like {0}, {1}, etc.
- ICU message format syntax
- Technical terms and proper nouns when appropriate

Target language: ${targetLanguage}

Important guidelines:
- Keep the same tone and style as the original
- Maintain consistency with software terminology
- Don't translate variable names, function names, or technical identifiers
- Preserve line breaks and formatting
- If the text contains HTML, keep all tags intact
- For plural forms, maintain the ICU MessageFormat syntax

Only return the translated text, nothing else.`;

    const userPrompt = context
      ? `Context: ${context}\n\nTranslate this text: "${text}"`
      : `Translate this text: "${text}"`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const translatedText = response.choices[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error("Empty response from OpenAI");
      }

      return translatedText;
    } catch (error) {
      console.error("OpenAI translation error:", error);

      // Check if it's a rate limit error
      if (this.isRateLimitError(error)) {
        const rateLimitError = new Error(
          `Rate limit exceeded: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        ) as RateLimitError;
        rateLimitError.isRateLimit = true;

        // Extract retry-after header if available
        if (error instanceof Error && "headers" in error) {
          const headers = (error as any).headers;
          if (headers && headers["retry-after"]) {
            rateLimitError.retryAfter = parseInt(headers["retry-after"]) * 1000;
          }
        }

        throw rateLimitError;
      }

      throw new Error(
        `Translation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private isRateLimitError(error: any): boolean {
    if (!error) return false;

    // Check for specific OpenAI rate limit indicators
    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code || error.status || 0;

    return (
      errorCode === 429 ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("quota exceeded") ||
      error.type === "rate_limit_exceeded"
    );
  }
}

export class AnthropicProvider implements LLMProvider {
  name = "Anthropic";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "claude-3-haiku-20240307") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async translate(
    text: string,
    targetLanguage: string,
    context?: string
  ): Promise<string> {
    const systemPrompt = `You are a professional translator specializing in software localization. 
Your task is to translate user interface strings while preserving:
- HTML tags and markup
- Variable placeholders like {0}, {1}, etc.
- ICU message format syntax
- Technical terms and proper nouns when appropriate

Target language: ${targetLanguage}

Important guidelines:
- Keep the same tone and style as the original
- Maintain consistency with software terminology
- Don't translate variable names, function names, or technical identifiers
- Preserve line breaks and formatting
- If the text contains HTML, keep all tags intact
- For plural forms, maintain the ICU MessageFormat syntax

Only return the translated text, nothing else.`;

    const userPrompt = context
      ? `Context: ${context}\n\nTranslate this text: "${text}"`
      : `Translate this text: "${text}"`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        // Check if it's a rate limit error
        if (this.isRateLimitError(response.status)) {
          const rateLimitError = new Error(
            `Rate limit exceeded: ${response.statusText}`
          ) as RateLimitError;
          rateLimitError.isRateLimit = true;

          // Extract retry-after header if available
          const retryAfter = response.headers.get("retry-after");
          if (retryAfter) {
            rateLimitError.retryAfter = parseInt(retryAfter) * 1000;
          }

          throw rateLimitError;
        }

        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.content?.[0]?.text?.trim();

      if (!translatedText) {
        throw new Error("Empty response from Anthropic");
      }

      return translatedText;
    } catch (error) {
      console.error("Anthropic translation error:", error);

      // Re-throw rate limit errors as-is
      if (error instanceof Error && "isRateLimit" in error) {
        throw error;
      }

      throw new Error(
        `Translation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private isRateLimitError(status: number): boolean {
    return status === 429;
  }
}

export class GeminiProvider implements LLMProvider {
  name = "Gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-2.0-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async translate(
    text: string,
    targetLanguage: string,
    context?: string
  ): Promise<string> {
    const systemPrompt = `You are a professional translator specializing in software localization. 
Your task is to translate user interface strings while preserving:
- HTML tags and markup
- Variable placeholders like {0}, {1}, etc.
- ICU message format syntax
- Technical terms and proper nouns when appropriate

Target language: ${targetLanguage}

Important guidelines:
- Keep the same tone and style as the original
- Maintain consistency with software terminology
- Don't translate variable names, function names, or technical identifiers
- Preserve line breaks and formatting
- If the text contains HTML, keep all tags intact
- For plural forms, maintain the ICU MessageFormat syntax

Only return the translated text, nothing else.`;

    const userPrompt = context
      ? `Context: ${context}\n\nTranslate this text: "${text}"`
      : `Translate this text: "${text}"`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\n${userPrompt}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (!response.ok) {
        // Check if it's a rate limit error
        if (this.isRateLimitError(response.status)) {
          const rateLimitError = new Error(
            `Rate limit exceeded: ${response.statusText}`
          ) as RateLimitError;
          rateLimitError.isRateLimit = true;

          // Extract retry-after header if available
          const retryAfter = response.headers.get("retry-after");
          if (retryAfter) {
            rateLimitError.retryAfter = parseInt(retryAfter) * 1000;
          }

          throw rateLimitError;
        }

        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!translatedText) {
        throw new Error("Empty response from Gemini");
      }

      return translatedText;
    } catch (error) {
      console.error("Gemini translation error:", error);

      // Re-throw rate limit errors as-is
      if (error instanceof Error && "isRateLimit" in error) {
        throw error;
      }

      throw new Error(
        `Translation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private isRateLimitError(status: number): boolean {
    return status === 429;
  }
}

export function createProvider(
  provider: string,
  apiKey: string,
  model?: string
): LLMProvider {
  switch (provider.toLowerCase()) {
    case "openai":
      return new OpenAIProvider(apiKey, model);
    case "anthropic":
      return new AnthropicProvider(apiKey, model);
    case "gemini":
      return new GeminiProvider(apiKey, model);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
