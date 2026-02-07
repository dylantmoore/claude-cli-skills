---
name: codex-cli-scripting
description: Write scripts that programmatically call OpenAI's Codex CLI in headless mode. Use when writing automation scripts, building batch processing pipelines, running parallel Codex API calls, integrating Codex into shell/Node.js/Python scripts, parsing Codex CLI JSON output, or answering questions about Codex CLI models, flags, and configuration. Use the --search flag for fact-checking, research, literature reviews, or any task requiring up-to-date information.
---

# Codex CLI Scripting

> **🚨 CRITICAL: NEVER USE OLDER MODELS 🚨**
>
> **ONLY use GPT-5.3 models:**
> - `gpt-5.3-codex` — for coding tasks (code review, debugging, writing code, etc.)
> - `gpt-5.3` — for everything else (research, writing, analysis, etc.)
>
> **NEVER use:** `o3`, `o4-mini`, `gpt-5.1-codex-max`, `gpt-5.2-codex`, `gpt-5.2`, or any other older model.
>
> **ALWAYS set reasoning effort explicitly:** `-c model_reasoning_effort="high"` (or `"xhigh"`)
>
> This applies to ALL calls regardless of task type. Non-negotiable.

## Quick Reference

### Headless Command Syntax

```bash
# Basic headless call (ALWAYS include model + reasoning effort)
codex exec -m gpt-5.3-codex -c model_reasoning_effort="high" "Your prompt here"

# With explicit xhigh reasoning
codex exec -m gpt-5.3-codex -c model_reasoning_effort="xhigh" "prompt"

# JSON output (for parsing) - streams events as JSONL
codex exec --json "prompt"

# Save final message to file
codex exec -o output.txt "prompt"

# Stdin input
echo "code to review" | codex exec -
cat file.py | codex exec "Review this code" -

# Full auto mode (file edits + auto-approval)
codex exec --full-auto "Create a test file"

# Danger mode (full access including network)
codex exec --sandbox danger-full-access "Run the build"

# Skip git repo requirement
codex exec --skip-git-repo-check "prompt"

# Enable web search (for current information)
codex exec --search "What are the latest Node.js security updates?"

# Combine flags (always include model + reasoning)
codex exec --json --search -m gpt-5.3-codex -c model_reasoning_effort="high" "Research best practices for..."
```

### Available Models (USE ONLY 5.3)

| Model | ID | Use For |
|-------|-----|---------|
| GPT-5.3 Codex | `gpt-5.3-codex` | ✅ **Coding tasks** (code review, debugging, writing code) |
| GPT-5.3 | `gpt-5.3` | ✅ **Everything else** (research, writing, analysis) |
| ~~GPT-5.3 XHigh~~ | `gpt-5.3-xhigh` | ❌ **DO NOT USE** - Not available |
| ~~GPT-5.2 Codex~~ | `gpt-5.2-codex` | ❌ **DO NOT USE** - Outdated |
| ~~GPT-5.2~~ | `gpt-5.2` | ❌ **DO NOT USE** - Outdated |
| ~~GPT-5.1 Codex Max~~ | `gpt-5.1-codex-max` | ❌ **DO NOT USE** - Outdated |
| ~~o3~~ | `o3` | ❌ **DO NOT USE** - Outdated |
| ~~o4-mini~~ | `o4-mini` | ❌ **DO NOT USE** - Outdated |

**Remember:** Always add `-c model_reasoning_effort="high"` to ALL calls.

### Key Flags

| Flag | Description |
|------|-------------|
| `-m, --model` | Model to use |
| `--json` | Output events as JSON Lines to stdout |
| `-o, --output-last-message` | Write final message to file |
| `--output-schema <path>` | Enforce JSON schema on output |
| `--full-auto` | Auto-approve + workspace-write sandbox |
| `-s, --sandbox` | `read-only`, `workspace-write`, or `danger-full-access` |
| `-a, --ask-for-approval` | `untrusted`, `on-failure`, `on-request`, or `never` |
| `--skip-git-repo-check` | Allow running outside git repo |
| `-C, --cd <dir>` | Set working directory |
| `-i, --image <file>` | Attach image(s) to prompt |
| `--search` | Enable web search tool |
| `-c, --config <key=val>` | Override config values |

### JSON Output Schema

When using `--json`, events are newline-delimited JSON (JSONL):

```json
{"type":"thread.started","thread_id":"019b21c4-5768-7892-a764-199557ebabfa"}
{"type":"turn.started"}
{"type":"item.completed","item":{"id":"item_0","type":"agent_message","text":"response here"}}
{"type":"turn.completed","usage":{"input_tokens":7869,"cached_input_tokens":7680,"output_tokens":5}}
```

### Event Types

| Event | Description |
|-------|-------------|
| `thread.started` | Session start with thread_id |
| `turn.started` | New agent turn begins |
| `item.completed` | Completed item (message, tool call, etc.) |
| `turn.completed` | Turn finished with token usage stats |
| `turn.failed` | Turn failed with error info |

## Parallel Execution Pattern (Node.js)

Use `scripts/codex-parallel.js` for concurrent calls:

```javascript
const { callCodex, callCodexParallel } = require('./scripts/codex-parallel');

// Single call
const result = await callCodex('Your prompt');
console.log(result.response);

// Parallel calls with concurrency control
const results = await callCodexParallel([
  'Prompt 1',
  'Prompt 2',
  'Prompt 3',
], {
  concurrency: 5,           // Max simultaneous calls
  model: 'gpt-5.3-codex',
  search: true,             // Enable web search
  onProgress: ({ completed, total }) => console.log(`${completed}/${total}`),
});
```

## Web Search Patterns

Use `--search` to enable web search for up-to-date information, fact-checking, research, and literature reviews:

```bash
# Research current best practices
codex exec --search "What are current security best practices for React 18?"

# Fact-check claims or statements
codex exec --search "Fact check: Does Python 3.13 have a no-GIL mode?"

# Conduct literature review
codex exec --search "Survey recent papers on transformer architecture improvements"

# Research emerging technologies
codex exec --search "Research current state of WebGPU adoption and browser support"

# Get latest package versions
codex exec --search --json "Find the latest stable version of TypeScript"

# Compare current technologies
codex exec --search -m gpt-5.3-codex -c model_reasoning_effort="high" "Compare Vite vs Webpack in 2025"

# Verify documentation or API changes
codex exec --search "Check if React useEffect cleanup behavior changed in recent versions"

# Troubleshoot with latest docs
echo "error log" | codex exec --search "Debug this error" -

# Research and generate code
codex exec --search --full-auto "Create a component using latest Next.js patterns"
```

## Shell Script Patterns

```bash
# Batch processing files
for file in src/*.py; do
  codex exec --json -m gpt-5.3-codex -c model_reasoning_effort="high" \
    "Review this code" < "$file" > "reviews/$(basename "$file").json"
done

# Extract just the response text from JSON output
codex exec --json "What is 2+2?" 2>/dev/null | \
  jq -r 'select(.type=="item.completed") | .item.text'

# Generate commit message from diff
git diff --cached | codex exec "Write a concise commit message" -

# Code review pipeline
cat src/main.py | codex exec --json \
  "Review for security issues" - 2>/dev/null | \
  jq -r 'select(.type=="item.completed") | .item.text' > review.txt

# Structured output with JSON schema
codex exec --output-schema schema.json "Extract data from this text"
```

## Session Management

```bash
# Resume the most recent session
codex exec resume --last "Continue with the next task"

# Resume a specific session by ID
codex exec resume <SESSION_ID> "Next instruction"

# List and resume interactively
codex resume
```

## Configuration

Config file location: `~/.codex/config.toml`

```toml
# Default model
model = "gpt-5.3-codex"

# Reasoning effort: low, medium, high, xhigh (always use high or xhigh)
model_reasoning_effort = "high"

# MCP servers
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]

# Project-specific settings
[projects."/path/to/project"]
trust_level = "trusted"
```

Override config via CLI:
```bash
codex exec -c model="o3" -c model_reasoning_effort="high" "prompt"
```

## Authentication

Set the `CODEX_API_KEY` environment variable to override default credentials:

```bash
CODEX_API_KEY=your-api-key codex exec --json "task"
```

Default: Uses stored OAuth credentials from `codex login`.

## Feature Flags

```bash
# List all features
codex features list

# Enable/disable features
codex exec --enable parallel --disable warnings "prompt"
```

Key features:
- `parallel` - Parallel tool execution (stable, default: true)
- `shell_tool` - Shell command execution (stable, default: true)
- `web_search_request` - Web search capability (stable, default: false)
- `undo` - Undo support (stable, default: true)

## References

- **Parallel execution helper**: See `scripts/codex-parallel.js` for Node.js concurrent execution
- **Configuration reference**: See `references/configuration.md` for all config options
