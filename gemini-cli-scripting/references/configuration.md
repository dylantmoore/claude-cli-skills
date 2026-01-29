# Gemini CLI Configuration Reference

## Table of Contents
- [Configuration File Locations](#configuration-file-locations)
- [Model Configuration](#model-configuration)
- [All Settings](#all-settings)
- [Environment Variables](#environment-variables)

## Configuration File Locations

Settings files load in priority order (later overrides earlier):

1. **System defaults**:
   - Linux: `/etc/gemini-cli/system-defaults.json`
   - macOS: `/Library/Application Support/GeminiCli/system-defaults.json`
   - Windows: `C:\ProgramData\gemini-cli\system-defaults.json`

2. **User settings**: `~/.gemini/settings.json`

3. **Project settings**: `.gemini/settings.json` (in project root)

Override paths with env vars:
- `GEMINI_CLI_SYSTEM_DEFAULTS_PATH`
- `GEMINI_CLI_SYSTEM_SETTINGS_PATH`

## Model Configuration

> **🚨 ONLY USE `gemini-3-pro-preview` 🚨**
>
> Never use older models (2.5-pro, 2.5-flash, etc.)

### Built-in Model Aliases

```
gemini-3-pro-preview     # ✅ USE THIS - Only approved model
gemini-2.5-pro           # ❌ DO NOT USE - Outdated
gemini-2.5-flash         # ❌ DO NOT USE - Outdated
gemini-2.5-flash-lite    # ❌ DO NOT USE - Outdated
gemini-2.5-flash-base    # ❌ DO NOT USE - Outdated
```

### Specialized Model Aliases

```
chat-base                # Default chat
chat-base-2.5            # 2.5 series chat
chat-base-3              # 3.0 series chat
classifier               # Classification tasks
summarizer-default       # Summarization
web-search               # Search-grounded
web-fetch                # Web content fetching
```

### Custom Model Configuration

In `settings.json`:

```json
{
  "model": {
    "name": "gemini-3-pro-preview",
    "maxSessionTurns": -1,
    "compressionThreshold": 0.5
  },
  "modelConfigs": {
    "customAliases": {
      "my-fast": {
        "name": "gemini-2.5-flash-lite"
      }
    }
  }
}
```

## All Settings

### General

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `general.previewFeatures` | boolean | false | Enable preview features |
| `general.preferredEditor` | string | - | Default editor |
| `general.vimMode` | boolean | false | Vim keybindings |
| `general.disableAutoUpdate` | boolean | false | Disable auto-updates |
| `general.checkpointing.enabled` | boolean | false | Save/resume sessions |
| `general.retryFetchErrors` | boolean | false | Auto-retry on errors |

### Output

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `output.format` | enum | "text" | Default output: "text" or "json" |

### UI

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `ui.theme` | string | - | Color theme |
| `ui.hideBanner` | boolean | false | Hide startup banner |
| `ui.hideFooter` | boolean | false | Hide status footer |
| `ui.showLineNumbers` | boolean | true | Show line numbers |
| `ui.useFullWidth` | boolean | true | Use full terminal width |
| `ui.accessibility.screenReader` | boolean | false | Screen reader mode |

### Session Retention

```json
{
  "general": {
    "sessionRetention": {
      "enabled": true,
      "maxAge": "30d",
      "maxCount": 100,
      "minRetention": "1d"
    }
  }
}
```

### Privacy

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `privacy.usageStatisticsEnabled` | boolean | true | Send anonymous usage stats |

## Environment Variables

String values in settings support env var interpolation:

```json
{
  "someKey": "$MY_VAR",
  "otherKey": "${MY_VAR}/path"
}
```

### Authentication Env Vars

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | API key authentication |
| `GOOGLE_CLOUD_PROJECT` | Vertex AI project |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account path |

### Path Env Vars

| Variable | Description |
|----------|-------------|
| `GEMINI_CLI_SYSTEM_DEFAULTS_PATH` | Override system defaults location |
| `GEMINI_CLI_SYSTEM_SETTINGS_PATH` | Override system settings location |
