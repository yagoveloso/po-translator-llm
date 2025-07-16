# Contributing to PO Translator LLM

We welcome contributions to improve the PO Translator LLM! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies:
   ```bash
   bun install
   ```
4. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development

### Prerequisites

- **Bun** (recommended) or Node.js
- API key from at least one LLM provider (OpenAI, Anthropic, or Gemini)

### Project Structure

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
├── README.md
└── LICENSE
```

### Code Style

- Use TypeScript for all source files
- Follow existing code style and formatting
- Write clear, descriptive comments in English
- Use meaningful variable and function names

### Testing

Before submitting a PR, please ensure:

1. Your code compiles without errors:

   ```bash
   bun run type-check
   ```

2. Test your changes with different providers:

   ```bash
   # Test with OpenAI
   bun run src/translate.ts -p openai -i test.po -o test_output.po

   # Test with Anthropic
   bun run src/translate.ts -p anthropic -i test.po -o test_output.po
   ```

## Types of Contributions

### Bug Fixes

- Fix existing functionality that isn't working as expected
- Improve error handling
- Fix rate limiting issues

### New Features

- Add support for new LLM providers
- Improve translation quality
- Add new command-line options
- Enhance progress reporting

### Documentation

- Improve README files
- Add usage examples
- Update API documentation
- Fix typos and grammar

### Translations

- Translate documentation to other languages
- Follow the existing pattern with language badges

## Submitting Changes

1. **Create a Pull Request**

   - Use a clear, descriptive title
   - Describe what changes you've made
   - Include any relevant issue numbers

2. **PR Description should include:**

   - What problem does this solve?
   - How did you test your changes?
   - Any breaking changes?
   - Screenshots/examples if applicable

3. **Code Review Process**
   - All PRs require review
   - Address feedback promptly
   - Keep your branch updated with main

## Provider-Specific Guidelines

### Adding New LLM Providers

When adding a new provider:

1. Implement the `LLMProvider` interface in `src/providers.ts`
2. Add the provider to the CLI options in `src/translate.ts`
3. Update documentation in all language versions
4. Add environment variable support
5. Test thoroughly with rate limiting

### Provider Implementation Requirements

- Implement proper error handling
- Support rate limiting detection
- Handle API key validation
- Maintain translation quality
- Follow the existing pattern for consistency

## Issue Guidelines

### Reporting Bugs

When reporting bugs, please include:

- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Bun/Node version)
- Provider being used
- Error messages/logs

### Feature Requests

When requesting features:

- Describe the use case
- Explain why it would be useful
- Consider implementation complexity
- Check if similar features exist

## Code of Conduct

This project follows a simple code of conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- No harassment or discrimination

## Questions?

Feel free to:

- Open an issue for questions
- Start a discussion for ideas
- Contact maintainers directly

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions help make PO Translator LLM better for everyone. Thank you for your time and effort!
