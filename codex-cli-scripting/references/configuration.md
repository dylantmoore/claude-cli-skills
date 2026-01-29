# Codex CLI Configuration Reference

## Config File Location

`~/.codex/config.toml`

## Full Configuration Options

```toml
# =============================================================================
# Model Settings
# =============================================================================

# Default model for all operations
model = "gpt-5.2-codex"

# Reasoning effort level: "low", "medium", "high", "xhigh"
# IMPORTANT: Always use "high" or "xhigh" for best results
model_reasoning_effort = "high"

# =============================================================================
# MCP Servers
# =============================================================================

# Configure Model Context Protocol servers for extended capabilities

[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]

[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@anthropic/mcp-server-filesystem", "/path/to/allowed/dir"]

# =============================================================================
# Project-Specific Settings
# =============================================================================

# Trust levels: "untrusted", "trusted"
# Trusted projects allow more automated operations

[projects."/path/to/your/project"]
trust_level = "trusted"

[projects."/another/project"]
trust_level = "untrusted"

# =============================================================================
# Shell Environment
# =============================================================================

[shell_environment_policy]
# Options: "all", "none", or list specific vars
inherit = "all"

# =============================================================================
# Sandbox Permissions
# =============================================================================

# Default sandbox permissions (array)
# Options: "disk-full-read-access", "disk-write-access", "network-access"
sandbox_permissions = ["disk-full-read-access"]

# =============================================================================
# Feature Flags
# =============================================================================

[features]
# Enable/disable specific features
parallel = true
undo = true
shell_tool = true
view_image_tool = true
warnings = true
web_search_request = false
```

## CLI Config Overrides

Override any config value via `-c` flag:

```bash
# Override model
codex exec -c model="o3" "prompt"

# Override reasoning effort
codex exec -c model_reasoning_effort="high" "prompt"

# Override sandbox permissions
codex exec -c 'sandbox_permissions=["disk-full-read-access", "network-access"]' "prompt"

# Multiple overrides
codex exec -c model="gpt-5.2-codex" -c model_reasoning_effort="high" "prompt"

# Nested values use dotted paths
codex exec -c shell_environment_policy.inherit="all" "prompt"
```

## Configuration Profiles

Define named profiles in config.toml:

```toml
[profiles.default]
model = "gpt-5.2-codex"
model_reasoning_effort = "high"

[profiles.thorough]
model = "gpt-5.2-codex"
model_reasoning_effort = "xhigh"
```

Use profiles via `-p` flag:

```bash
codex exec -p fast "quick task"
codex exec -p thorough "complex analysis"
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CODEX_API_KEY` | Override API key for `codex exec` |
| `OPENAI_API_KEY` | Fallback API key |
| `CODEX_CONFIG_PATH` | Custom config file location |

## Model Aliases (USE ONLY 5.2)

**ONLY use GPT-5.2 models. NEVER use older models.**

| Alias | Use For | Status |
|-------|---------|--------|
| `gpt-5.2-codex` | Coding tasks (code review, debugging, writing code) | ✅ **USE** |
| `gpt-5.2` | Everything else (research, writing, analysis) | ✅ **USE** |
| `gpt-5.2-xhigh` | N/A | ❌ **DO NOT USE** - Not available |
| `gpt-5.1-codex-max` | N/A | ❌ **DO NOT USE** - Outdated |
| `o3` | N/A | ❌ **DO NOT USE** - Outdated |
| `o4-mini` | N/A | ❌ **DO NOT USE** - Outdated |

**ALWAYS add `-c model_reasoning_effort="high"` to ALL calls.**

## Sandbox Modes

| Mode | Description |
|------|-------------|
| `read-only` | Can read files, no writes or network |
| `workspace-write` | Can read/write in workspace |
| `danger-full-access` | Full system access (use with caution) |

## Approval Policies

| Policy | Description |
|--------|-------------|
| `untrusted` | Only run trusted commands (ls, cat, etc.) |
| `on-failure` | Auto-run, ask only on failure |
| `on-request` | Model decides when to ask |
| `never` | Never ask, return failures to model |
