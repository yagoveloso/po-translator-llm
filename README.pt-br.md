# Tradutor de Arquivos .po com LLMs

[![English](https://img.shields.io/badge/lang-en-blue.svg)](README.md)
[![Portuguese](https://img.shields.io/badge/lang-pt--br-green.svg)](README.pt-br.md)

Este script utiliza modelos de linguagem (LLMs) para traduzir arquivos `.po` (Portable Object) automaticamente, mantendo a formatação e estrutura originais.

## Características

- ✅ Suporte a múltiplos provedores LLM (OpenAI, Anthropic, Gemini)
- ✅ Preserva placeholders, tags HTML e formatação ICU MessageFormat
- ✅ Tradução em lotes com controle de taxa
- ✅ Retry automático em caso de falha
- ✅ Barra de progresso e logs detalhados
- ✅ Configuração via argumentos ou variáveis de ambiente

## Instalação

```bash
# Instalar dependências
bun install

# Ou com npm
npm install
```

## Uso

### 1. Configuração da API Key

Defina a variável de ambiente com sua chave da API:

```bash
# Para OpenAI
export OPENAI_API_KEY="sk-sua-chave-aqui"

# Para Anthropic
export ANTHROPIC_API_KEY="sua-chave-aqui"

# Para Gemini
export GEMINI_API_KEY="sua-chave-aqui"
```

### 2. Tradução Básica

```bash
# Traduzir web.po para português usando OpenAI
bun run src/translate.ts

# Especificar arquivos customizados
bun run src/translate.ts -i input.po -o output.po

# Usar um provedor específico
bun run src/translate.ts -p anthropic -k sua-chave-aqui
```

### 3. Opções Avançadas

```bash
# Traduzir com configurações personalizadas
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

### 4. Parâmetros Disponíveis

| Parâmetro           | Descrição                                | Padrão                |
| ------------------- | ---------------------------------------- | --------------------- |
| `-i, --input`       | Arquivo .po de entrada                   | `web.po`              |
| `-o, --output`      | Arquivo .po de saída                     | `web_translated.po`   |
| `-p, --provider`    | Provedor LLM (openai, anthropic, gemini) | `openai`              |
| `-k, --api-key`     | Chave da API                             | Variável de ambiente  |
| `-m, --model`       | Modelo específico                        | `gpt-4o-mini`         |
| `-l, --language`    | Idioma de destino                        | `Portuguese (Brazil)` |
| `-b, --batch-size`  | Tamanho do lote                          | `10`                  |
| `-d, --delay`       | Delay entre lotes (ms)                   | `1000`                |
| `-r, --max-retries` | Tentativas máximas                       | `3`                   |
| `-h, --help`        | Mostrar ajuda                            | -                     |

## Exemplos de Uso

### Traduzir para diferentes idiomas

```bash
# Espanhol
bun run src/translate.ts -l "Spanish (Spain)"

# Francês
bun run src/translate.ts -l "French (France)"

# Alemão
bun run src/translate.ts -l "German (Germany)"
```

### Usar diferentes modelos

```bash
# OpenAI GPT-4
bun run src/translate.ts -p openai -m gpt-4o

# Anthropic Claude
bun run src/translate.ts -p anthropic -m claude-3-sonnet-20240229

# Gemini Pro
bun run src/translate.ts -p gemini -m gemini-pro
```

### Configuração para grandes arquivos

```bash
# Lotes menores com delay maior para evitar rate limiting
bun run src/translate.ts -b 3 -d 3000 -r 5
```

## Estrutura do Projeto

```
po-translator-llm/
├── src/
│   ├── types.ts         # Definições de tipos
│   ├── parser.ts        # Parser de arquivos .po
│   ├── providers.ts     # Implementações dos provedores LLM
│   ├── translator.ts    # Lógica principal de tradução
│   └── translate.ts     # Script CLI
├── package.json
├── tsconfig.json
├── web.po              # Arquivo de entrada
└── README.md
```

## Recursos Especiais

### Preservação de Formatação

O script mantém automaticamente:

- Variáveis e placeholders: `{0}`, `{1}`, `%s`, etc.
- Tags HTML: `<0>`, `<1>`, `<strong>`, etc.
- Formatação ICU MessageFormat: `{count, plural, one {...} other {...}}`
- Comentários do código fonte

### Controle de Taxa

- **Batch Size**: Processa múltiplas traduções em paralelo
- **Delay**: Pausa entre lotes para evitar rate limiting
- **Retry**: Tentativas automáticas em caso de falha

### Exemplos de Preservação

```po
# Entrada
msgid "You have {0, plural, one {1 document} other {# documents}}"
msgstr ""

# Saída
msgstr "Você tem {0, plural, one {1 documento} other {# documentos}}"
```

```po
# Entrada
msgid "Welcome <0>{username}</0> to our platform!"
msgstr ""

# Saída
msgstr "Bem-vindo <0>{username}</0> à nossa plataforma!"
```

## Troubleshooting

### Erro de API Key

```bash
❌ Chave da API não encontrada para o provedor openai
   Use a opção -k para fornecer a chave ou defina a variável de ambiente correspondente.
```

**Solução**: Defina a variável de ambiente ou use `-k sua-chave-aqui`

### Rate Limiting

```bash
❌ Translation failed: Rate limit exceeded
   Retrying... (1/3)
```

**Solução**: Aumente o delay (`-d 2000`) ou diminua o batch size (`-b 5`)

### Arquivo não encontrado

```bash
⚠️  Arquivo web.po não encontrado.
```

**Solução**: Verifique o caminho do arquivo ou use `-i caminho/para/arquivo.po`

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## Licença

Este projeto é licenciado sob a MIT License.
