---
name: gemini-cli-scripting
description: Write scripts that programmatically call Google's Gemini CLI in headless mode. Use when writing automation scripts, building batch processing pipelines, running parallel Gemini API calls, integrating Gemini into shell/Node.js/Python scripts, parsing Gemini CLI JSON output, or answering questions about Gemini CLI models, flags, and configuration.
---

# Gemini CLI Scripting

> **🚨 CRITICAL: NEVER USE OLDER MODELS 🚨**
>
> **ONLY use Gemini 3 Pro:**
> - `gemini-3-pro-preview` — the ONLY model to use
>
> **NEVER use:** `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, or any other older model.
>
> This is non-negotiable. Do not downgrade models for "speed" or "cost" reasons.

## Quick Reference

### Headless Command Syntax

```bash
# Basic headless call (ALWAYS specify the model)
gemini -m gemini-3-pro-preview "Your prompt here"

# With JSON output
gemini -m gemini-3-pro-preview --output-format json "prompt"

# Streaming JSON (real-time events)
gemini -m gemini-3-pro-preview --output-format stream-json "prompt"

# Stdin input
echo "code to review" | gemini -m gemini-3-pro-preview "Review this code"
cat file.py | gemini -m gemini-3-pro-preview "Find bugs"

# Auto-approve tool use
gemini -m gemini-3-pro-preview -y "Create a test file"
gemini -m gemini-3-pro-preview --approval-mode yolo "Run the build"
```

### Available Models (USE ONLY 3 Pro)

| Model | ID | Status |
|-------|-----|--------|
| Gemini 3 Pro | `gemini-3-pro-preview` | ✅ **USE THIS** - Only approved model |
| ~~Gemini 2.5 Pro~~ | `gemini-2.5-pro` | ❌ **DO NOT USE** - Outdated |
| ~~Gemini 2.5 Flash~~ | `gemini-2.5-flash` | ❌ **DO NOT USE** - Outdated |
| ~~Gemini 2.5 Flash Lite~~ | `gemini-2.5-flash-lite` | ❌ **DO NOT USE** - Outdated |

**Remember:** Always specify `-m gemini-3-pro-preview` in ALL calls.

### Key Flags

| Flag | Description |
|------|-------------|
| `-m, --model` | Model to use |
| `-o, --output-format` | `text`, `json`, or `stream-json` |
| `-y, --yolo` | Auto-approve all tool actions |
| `--approval-mode` | `default`, `auto_edit`, or `yolo` |
| `-d, --debug` | Enable debug output |
| `--include-directories` | Add directories to context |

### JSON Output Schema

```json
{
  "response": "The AI response text",
  "stats": {
    "models": {
      "gemini-3-pro-preview": {
        "api": { "totalRequests": 1, "totalErrors": 0, "totalLatencyMs": 2500 },
        "tokens": { "prompt": 5000, "candidates": 100, "total": 5100 }
      }
    },
    "tools": { "totalCalls": 0, "totalSuccess": 0 },
    "files": { "totalLinesAdded": 0, "totalLinesRemoved": 0 }
  },
  "error": null
}
```

### Stream JSON Events

When using `--output-format stream-json`, events are newline-delimited JSON:

1. `init` - Session start with session_id
2. `message` - User/assistant messages
3. `tool_use` - Tool call requests
4. `tool_result` - Tool execution results
5. `error` - Non-fatal errors
6. `result` - Final outcome with stats

## Parallel Execution Pattern (Node.js)

Use `scripts/gemini-parallel.js` for concurrent calls:

```javascript
const { callGemini, callGeminiParallel } = require('./scripts/gemini-parallel');

// Single call (always specify model)
const result = await callGemini('Your prompt', { model: 'gemini-3-pro-preview' });
console.log(result.response);

// Parallel calls with concurrency control
const results = await callGeminiParallel([
  'Prompt 1',
  'Prompt 2',
  'Prompt 3',
], {
  concurrency: 5,
  model: 'gemini-3-pro-preview',  // ALWAYS use this model
  onProgress: ({ completed, total }) => console.log(`${completed}/${total}`),
});
```

## Shell Script Patterns

```bash
# Batch processing
for file in src/*.py; do
  gemini -m gemini-3-pro-preview --output-format json \
    "Review this code" < "$file" > "reviews/$(basename "$file").json"
done

# Extract just the response
gemini -m gemini-3-pro-preview --output-format json "What is 2+2?" | jq -r '.response'

# Generate commit message from diff
git diff --cached | gemini -m gemini-3-pro-preview "Write a concise commit message"

# Code review pipeline
cat src/main.py | gemini -m gemini-3-pro-preview --output-format json \
  "Review for security issues" | jq -r '.response' > review.txt
```

## Authentication

The CLI supports three auth methods (no API key needed for OAuth):

1. **Google OAuth** (default): 60 req/min, 1000 req/day - just run `gemini` and login
2. **API Key**: Set `GEMINI_API_KEY` env var
3. **Vertex AI**: Enterprise with `GOOGLE_CLOUD_PROJECT`

## References

- **Configuration options**: See `references/configuration.md` for all settings, model aliases, and config file locations
- **Headless mode details**: See `references/headless.md` for complete output format reference and advanced patterns
