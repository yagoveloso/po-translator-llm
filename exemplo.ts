#!/usr/bin/env bun

/**
 * Exemplo de uso do tradutor de arquivos .po
 *
 * Este script demonstra como usar o tradutor programaticamente
 */

import { translatePoFile } from "./src/translator";
import type { TranslationConfig } from "./src/types";

async function exemploBasico() {
  console.log("🚀 Exemplo: Tradução básica com OpenAI");

  const config: TranslationConfig = {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY || "sua-chave-aqui",
    model: "gpt-4o-mini",
    targetLanguage: "Portuguese (Brazil)",
    batchSize: 5,
    delay: 1500,
    maxRetries: 3,
  };

  try {
    await translatePoFile(config, "web.po", "web_traduzido.po");
    console.log("✅ Tradução concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

async function exemploAvancado() {
  console.log("🚀 Exemplo: Tradução avançada com configurações customizadas");

  const config: TranslationConfig = {
    provider: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY || "sua-chave-aqui",
    model: "claude-3-haiku-20240307",
    targetLanguage: "Spanish (Spain)",
    batchSize: 3,
    delay: 2000,
    maxRetries: 5,
  };

  try {
    await translatePoFile(config, "web.po", "web_espanhol.po");
    console.log("✅ Tradução para espanhol concluída!");
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

// Executar exemplos
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes("--avancado")) {
    exemploAvancado();
  } else {
    exemploBasico();
  }
}
