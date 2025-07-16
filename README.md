# PO File Translator with LLMs

[![English](https://img.shields.io/badge/lang-en-blue.svg)](README.md)
[![Portuguese](https://img.shields.io/badge/lang-pt--br-green.svg)](README.pt-br.md)

This script uses Language Learning Models (LLMs) to automatically translate `.po` (Portable Object) files while preserving original formatting and structure.

## Features

- ✅ Support for multiple LLM providers (OpenAI, Anthropic, Gemini)
- ✅ Preserves placeholders, HTML tags, and ICU MessageFormat formatting
- ✅ Batch translation with rate limiting control
- ✅ Automatic retry on failures
- ✅ Progress bar and detailed logging
- ✅ Configuration via command line arguments or environment variables

## Installation

```bash
# Install dependencies
bun install

# Or with npm
npm install
```

## Usage

### 1. API Key Setup

Set the environment variable with your API key:

```bash
# For OpenAI
export OPENAI_API_KEY="sk-your-key-here"

# For Anthropic
export ANTHROPIC_API_KEY="your-key-here"

# For Gemini
export GEMINI_API_KEY="your-key-here"
```

### 2. Basic Translation

```bash
# Translate web.po to Portuguese using OpenAI
bun run src/translate.ts

# Specify custom files
bun run src/translate.ts -i input.po -o output.po

# Use a specific provider
bun run src/translate.ts -p anthropic -k your-key-here
```

### 3. Advanced Options

```bash
# Translate with custom settings
bun run src/translate.ts \\
  -i web.po \\
  -o web_pt.po \\
  -p openai \\
  -m gpt-4o \\
  -l "Portuguese (Brazil)" \\
  -b 5 \\
  -d 2000 \\
  -r 5
```

### 4. Available Parameters

| Parameter           | Description                              | Default               |
| ------------------- | ---------------------------------------- | --------------------- |
| `-i, --input`       | Input .po file                           | `web.po`              |
| `-o, --output`      | Output .po file                          | `web_translated.po`   |
| `-p, --provider`    | LLM provider (openai, anthropic, gemini) | `openai`              |
| `-k, --api-key`     | API key                                  | Environment variable  |
| `-m, --model`       | Specific model                           | `gpt-4o-mini`         |
| `-l, --language`    | Target language                          | `Portuguese (Brazil)` |
| `-b, --batch-size`  | Batch size                               | `10`                  |
| `-d, --delay`       | Delay between batches (ms)               | `1000`                |
| `-r, --max-retries` | Maximum retries                          | `3`                   |
| `-h, --help`        | Show help                                | -                     |

## Usage Examples

### Translate to different languages

```bash
# Spanish
bun run src/translate.ts -l "Spanish (Spain)"

# French
bun run src/translate.ts -l "French (France)"

# German
bun run src/translate.ts -l "German (Germany)"
```

### Use different models

```bash
# OpenAI GPT-4
bun run src/translate.ts -p openai -m gpt-4o

# Anthropic Claude
bun run src/translate.ts -p anthropic -m claude-3-sonnet-20240229

# Gemini Pro
bun run src/translate.ts -p gemini -m gemini-pro
```

### Configuration for large files

```bash
# Smaller batches with larger delay to avoid rate limiting
bun run src/translate.ts -b 3 -d 3000 -r 5
```

## Project Structure

```
po-translator-llm/
├── src/
│   ├── types.ts         # Type definitions
│   ├── parser.ts        # .po file parser
│   ├── providers.ts     # LLM provider implementations
│   ├── translator.ts    # Main translation logic
│   └── translate.ts     # CLI script
├── package.json
├── tsconfig.json
├── web.po              # Input file
└── README.md
```

## Special Features

### Format Preservation

The script automatically maintains:

- Variables and placeholders: `{0}`, `{1}`, `%s`, etc.
- HTML tags: `<0>`, `<1>`, `<strong>`, etc.
- ICU MessageFormat: `{count, plural, one {...} other {...}}`
- Source code comments

### Rate Control

- **Batch Size**: Processes multiple translations in parallel
- **Delay**: Pause between batches to avoid rate limiting
- **Retry**: Automatic retries on failures

### Preservation Examples

```po
# Input
msgid "You have {0, plural, one {1 document} other {# documents}}"
msgstr ""

# Output
msgstr "Você tem {0, plural, one {1 documento} other {# documentos}}"
```

```po
# Input
msgid "Welcome <0>{username}</0> to our platform!"
msgstr ""

# Output
msgstr "Bem-vindo <0>{username}</0> à nossa plataforma!"
```

## Troubleshooting

### API Key Error

```bash
❌ API key not found for provider openai
   Use the -k option to provide the key or set the corresponding environment variable.
```

**Solution**: Set the environment variable or use `-k your-key-here`

### Rate Limiting

```bash
❌ Translation failed: Rate limit exceeded
   Retrying... (1/3)
```

**Solution**: Increase delay (`-d 2000`) or decrease batch size (`-b 5`)

### File not found

```bash
⚠️  File web.po not found.
```

**Solution**: Check the file path or use `-i path/to/file.po`

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

## License

This project is licensed under the MIT License.
