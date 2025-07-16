# 🚀 Guia de Uso Rápido - Tradutor de Arquivos .po

[![English](https://img.shields.io/badge/lang-en-blue.svg)](USAGE.md)
[![Portuguese](https://img.shields.io/badge/lang-pt--br-green.svg)](USAGE.pt-br.md)

## Pré-requisitos

1. **Bun** instalado (recomendado) ou Node.js
2. **Chave da API** de um provedor LLM

## Instalação Rápida

```bash
# Clonar ou baixar o projeto
cd po-translator-llm

# Instalar dependências
bun install

# Configurar variável de ambiente
export OPENAI_API_KEY="sua-chave-aqui"
```

## Uso Básico

### 1. Tradução Simples

```bash
# Traduzir web.po para português (padrão)
bun run src/translate.ts

# Resultado: web_translated.po
```

### 2. Especificar Arquivos

```bash
# Arquivo de entrada e saída customizados
bun run src/translate.ts -i meu_arquivo.po -o meu_arquivo_pt.po
```

### 3. Diferentes Idiomas

```bash
# Espanhol
bun run src/translate.ts -l "Spanish (Spain)"

# Francês
bun run src/translate.ts -l "French (France)"

# Alemão
bun run src/translate.ts -l "German (Germany)"

# Inglês
bun run src/translate.ts -l "English (United States)"
```

### 4. Diferentes Provedores

```bash
# OpenAI (padrão)
bun run src/translate.ts -p openai -k sk-sua-chave

# Anthropic Claude
bun run src/translate.ts -p anthropic -k sua-chave

# Google Gemini
bun run src/translate.ts -p gemini -k sua-chave
```

## Configurações Avançadas

### Otimização para Grandes Arquivos

```bash
# Lotes menores, delay maior
bun run src/translate.ts -b 5 -d 2000 -r 5
```

### Usar Modelos Específicos

```bash
# GPT-4o
bun run src/translate.ts -p openai -m gpt-4o

# Claude Sonnet
bun run src/translate.ts -p anthropic -m claude-3-sonnet-20240229
```

## Scripts NPM Disponíveis

```bash
# Tradução padrão
bun run translate

# Provedores específicos
bun run translate:openai
bun run translate:anthropic
bun run translate:gemini

# Ajuda
bun run help
```

## Exemplo Completo

```bash
# Traduzir web.po para português usando OpenAI GPT-4o
# com lotes de 5 entradas e delay de 2 segundos
bun run src/translate.ts \
  -i web.po \
  -o web_pt_BR.po \
  -p openai \
  -m gpt-4o \
  -l "Portuguese (Brazil)" \
  -b 5 \
  -d 2000 \
  -r 3
```

## Monitoramento do Progresso

Durante a tradução, você verá:

```
🚀 Iniciando tradução...
📂 Entrada: web.po
📂 Saída: web_translated.po
🌍 Idioma: Portuguese (Brazil)
🤖 Provedor: openai
📊 Found 1847 entries to translate
🔄 [████████████████████] 100% (1847/1847) - Translation completed
✅ Translation completed!
```

## Solução de Problemas

### Erro de Rate Limit

```bash
# Aumentar delay e diminuir batch size
bun run src/translate.ts -b 3 -d 3000
```

### Muitas Falhas

```bash
# Aumentar tentativas e delay
bun run src/translate.ts -r 5 -d 2000
```

### Verificar Progresso

O arquivo de saída é salvo apenas no final. Para traduções longas, monitore o progresso pela barra de progresso no terminal.

## Dicas de Uso

1. **Custo**: Modelos menores (gpt-4o-mini, claude-haiku) são mais baratos
2. **Qualidade**: Modelos maiores (gpt-4o, claude-sonnet) são mais precisos
3. **Velocidade**: Lotes maiores são mais rápidos mas podem causar rate limiting
4. **Backup**: Sempre faça backup do arquivo original antes de traduzir

## Estimativa de Custos

Para 1847 entradas (como web.po):

- **GPT-4o-mini**: ~$0.50-1.00
- **GPT-4o**: ~$5.00-10.00
- **Claude Haiku**: ~$0.25-0.50
- **Claude Sonnet**: ~$1.50-3.00

_Valores aproximados, podem variar conforme o tamanho do texto_
