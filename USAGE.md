# 🚀 Quick Start Guide - PO File Translator

[![English](https://img.shields.io/badge/lang-en-blue.svg)](USAGE.md)
[![Portuguese](https://img.shields.io/badge/lang-pt--br-green.svg)](USAGE.pt-br.md)

## Prerequisites

1. **Bun** installed (recommended) or Node.js
2. **API key** from an LLM provider

## Quick Installation

```bash
# Clone or download the project
cd po-translator-llm

# Install dependencies
bun install

# Set environment variable
export OPENAI_API_KEY="your-key-here"
```

## Basic Usage

### 1. Simple Translation

```bash
# Translate web.po to Portuguese (default)
bun run src/translate.ts

# Result: web_translated.po
```

### 2. Specify Files

```bash
# Custom input and output files
bun run src/translate.ts -i my_file.po -o my_file_pt.po
```

### 3. Different Languages

```bash
# Spanish
bun run src/translate.ts -l "Spanish (Spain)"

# French
bun run src/translate.ts -l "French (France)"

# German
bun run src/translate.ts -l "German (Germany)"

# English
bun run src/translate.ts -l "English (United States)"
```

### 4. Different Providers

```bash
# OpenAI (default)
bun run src/translate.ts -p openai -k sk-your-key

# Anthropic Claude
bun run src/translate.ts -p anthropic -k your-key

# Google Gemini
bun run src/translate.ts -p gemini -k your-key
```

## Advanced Settings

### Optimization for Large Files

```bash
# Smaller batches, larger delay
bun run src/translate.ts -b 5 -d 2000 -r 5
```

### Use Specific Models

```bash
# GPT-4o
bun run src/translate.ts -p openai -m gpt-4o

# Claude Sonnet
bun run src/translate.ts -p anthropic -m claude-3-sonnet-20240229
```

## Available NPM Scripts

```bash
# Default translation
bun run translate

# Specific providers
bun run translate:openai
bun run translate:anthropic
bun run translate:gemini

# Help
bun run help
```

## Complete Example

```bash
# Translate web.po to Portuguese using OpenAI GPT-4o
# with batches of 5 entries and 2 second delay
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

## Progress Monitoring

During translation, you'll see:

```
🚀 Starting translation...
📂 Input: web.po
📂 Output: web_translated.po
🌍 Language: Portuguese (Brazil)
🤖 Provider: openai
📊 Found 1847 entries to translate
🔄 [████████████████████] 100% (1847/1847) - Translation completed
✅ Translation completed!
```

## Troubleshooting

### Rate Limit Error

```bash
# Increase delay and decrease batch size
bun run src/translate.ts -b 3 -d 3000
```

### Too Many Failures

```bash
# Increase retries and delay
bun run src/translate.ts -r 5 -d 2000
```

### Check Progress

The output file is saved only at the end. For long translations, monitor progress through the terminal progress bar.

## Usage Tips

1. **Cost**: Smaller models (gpt-4o-mini, claude-haiku) are cheaper
2. **Quality**: Larger models (gpt-4o, claude-sonnet) are more accurate
3. **Speed**: Larger batches are faster but may cause rate limiting
4. **Backup**: Always backup the original file before translating

## Cost Estimation

For 1847 entries (like web.po):

- **GPT-4o-mini**: ~$0.50-1.00
- **GPT-4o**: ~$5.00-10.00
- **Claude Haiku**: ~$0.25-0.50
- **Claude Sonnet**: ~$1.50-3.00

_Approximate values, may vary based on text size_
