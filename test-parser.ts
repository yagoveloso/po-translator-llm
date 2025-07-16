#!/usr/bin/env bun

/**
 * Script para testar o parser de arquivos .po
 */

import { PoParser } from "./src/parser";

async function testarParser() {
  console.log("🔍 Testando parser de arquivos .po...\n");

  try {
    // Ler o arquivo web.po
    const file = Bun.file("web.po");
    const content = await file.text();

    console.log("📄 Arquivo carregado com sucesso!");
    console.log(`📊 Tamanho: ${content.length} caracteres`);

    // Parsear o arquivo
    const poFile = PoParser.parse(content);

    console.log("\n📋 Informações do arquivo:");
    console.log(`🌍 Idioma: ${poFile.header.Language || "N/A"}`);
    console.log(`📝 Total de entradas: ${poFile.entries.length}`);

    // Contar entradas que precisam de tradução
    const entriesToTranslate = poFile.entries.filter((entry) => {
      if (!entry.msgid || entry.msgid === "") return false;
      if (entry.msgstr && entry.msgstr !== "" && entry.msgstr !== entry.msgid)
        return false;
      return true;
    });

    console.log(
      `🔄 Entradas que precisam de tradução: ${entriesToTranslate.length}`
    );

    // Mostrar algumas entradas de exemplo
    console.log("\n📝 Exemplos de entradas que precisam de tradução:");

    for (let i = 0; i < Math.min(5, entriesToTranslate.length); i++) {
      const entry = entriesToTranslate[i];
      const truncated =
        entry.msgid.length > 80
          ? entry.msgid.substring(0, 77) + "..."
          : entry.msgid;

      console.log(`${i + 1}. "${truncated}"`);

      if (entry.comments) {
        console.log(`   Contexto: ${entry.comments.join(" ")}`);
      }
      console.log("");
    }

    // Testar serialização
    console.log("🔄 Testando serialização...");
    const serialized = PoParser.serialize(poFile);
    console.log(
      `✅ Serialização bem-sucedida! (${serialized.length} caracteres)`
    );

    // Salvar um arquivo de teste
    await Bun.write("test_output.po", serialized);
    console.log("💾 Arquivo de teste salvo como test_output.po");
  } catch (error) {
    console.error("❌ Erro ao testar parser:", error);
  }
}

// Executar teste
testarParser();
