# Claude CLI Skills

Custom [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills for scripting third-party AI CLIs in headless mode. These skills teach Claude Code how to programmatically call OpenAI's Codex CLI and Google's Gemini CLI, enabling multi-model parallel workflows.

## Skills

### `codex-cli-scripting`

Script OpenAI's [Codex CLI](https://github.com/openai/codex) in headless mode. Covers command syntax, JSON output parsing, parallel execution (Node.js), web search, shell patterns, and configuration.

### `gemini-cli-scripting`

Script Google's [Gemini CLI](https://github.com/google-gemini/gemini-cli) in headless mode. Covers command syntax, JSON/stream-JSON output parsing, parallel execution (Node.js), shell patterns, and configuration.

## Installation

Copy the skill directories into your Claude Code skills folder:

```bash
# Clone this repo
git clone https://github.com/dylantmoore/claude-cli-skills.git

# Copy skills into your Claude Code config
cp -r claude-cli-skills/codex-cli-scripting ~/.claude/skills/
cp -r claude-cli-skills/gemini-cli-scripting ~/.claude/skills/
```

Each skill includes:

- **`SKILL.md`** -- Main skill definition with quick reference, usage patterns, and examples
- **`scripts/`** -- Node.js helper modules for parallel execution with concurrency control
- **`references/`** -- Detailed configuration and CLI reference docs

## Permissions and Sandbox Modes

Both CLIs support flags that grant sub-agents elevated permissions (e.g., `--full-auto`, `--sandbox danger-full-access` for Codex; `--yolo`, `--approval-mode yolo` for Gemini). The parallel execution scripts default to safe settings (`read-only` sandbox for Codex, default approval mode for Gemini), but the SKILL.md docs reference these flags as available options.

If you use the permissive modes, the sub-agents can write files, execute shell commands, and access the network without confirmation. Only use them in trusted, sandboxed environments where you understand what the agent will do.

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- [Codex CLI](https://github.com/openai/codex) installed (for the codex skill)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed (for the gemini skill)

## License

MIT
