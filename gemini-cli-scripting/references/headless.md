# Gemini CLI Headless Mode Reference

## Table of Contents
- [Command Line Options](#command-line-options)
- [Output Formats](#output-formats)
- [JSON Schema Details](#json-schema-details)
- [Stream JSON Events](#stream-json-events)
- [Piping and Redirection](#piping-and-redirection)
- [Advanced Patterns](#advanced-patterns)

## Command Line Options

### Core Options

| Option | Short | Description |
|--------|-------|-------------|
| `--model` | `-m` | Model ID (e.g., `gemini-3-pro-preview`) |
| `--output-format` | `-o` | Output format: `text`, `json`, `stream-json` |
| `--debug` | `-d` | Enable debug output |
| `--yolo` | `-y` | Auto-approve all tool actions |
| `--approval-mode` | - | `default`, `auto_edit`, or `yolo` |

### Context Options

| Option | Description |
|--------|-------------|
| `--include-directories` | Additional directories (comma-separated) |
| `--resume` | Resume session: `latest` or index number |
| `--list-sessions` | List available sessions |

### Tool Control

| Option | Description |
|--------|-------------|
| `--allowed-tools` | Tools allowed without confirmation |
| `--allowed-mcp-server-names` | Allowed MCP servers |
| `--sandbox` | Run in sandbox mode |

## Output Formats

### Text (Default)

Plain text response, human-readable:

```bash
$ gemini "What is 2+2?"
4
```

### JSON

Structured output with metadata:

```bash
$ gemini --output-format json "What is 2+2?"
{
  "response": "4",
  "stats": { ... },
  "error": null
}
```

### Stream JSON

Real-time newline-delimited events:

```bash
$ gemini --output-format stream-json "What is 2+2?"
{"type":"init","timestamp":"...","session_id":"..."}
{"type":"message","timestamp":"...","role":"user","content":"What is 2+2?"}
{"type":"message","timestamp":"...","role":"assistant","content":"4"}
{"type":"result","timestamp":"...","stats":{...}}
```

## JSON Schema Details

### Response Object

```typescript
interface GeminiResponse {
  response: string;           // The AI-generated text
  stats: {
    models: {
      [modelName: string]: {
        api: {
          totalRequests: number;
          totalErrors: number;
          totalLatencyMs: number;
        };
        tokens: {
          prompt: number;      // Input tokens
          candidates: number;  // Output tokens
          total: number;       // Total tokens
          cached: number;      // Cached tokens (cost savings)
          thoughts: number;    // Thinking tokens
          tool: number;        // Tool-related tokens
        };
      };
    };
    tools: {
      totalCalls: number;
      totalSuccess: number;
      totalFail: number;
      totalDurationMs: number;
      totalDecisions: {
        accept: number;
        reject: number;
        modify: number;
        auto_accept: number;
      };
      byName: { [toolName: string]: object };
    };
    files: {
      totalLinesAdded: number;
      totalLinesRemoved: number;
    };
  };
  error: {
    type: string;
    message: string;
    code?: number;
  } | null;
}
```

## Stream JSON Events

### Event Types

#### 1. init
Session initialization:
```json
{"type":"init","timestamp":"2025-01-01T00:00:00Z","session_id":"abc123","model":"gemini-3-pro-preview"}
```

#### 2. message
User or assistant message:
```json
{"type":"message","timestamp":"...","role":"user|assistant","content":"..."}
```

#### 3. tool_use
Tool invocation request:
```json
{"type":"tool_use","timestamp":"...","tool":"shell","parameters":{"command":"ls"}}
```

#### 4. tool_result
Tool execution outcome:
```json
{"type":"tool_result","timestamp":"...","tool":"shell","success":true,"output":"..."}
```

#### 5. error
Non-fatal error:
```json
{"type":"error","timestamp":"...","message":"Rate limit warning"}
```

#### 6. result
Final session result with aggregated stats:
```json
{"type":"result","timestamp":"...","stats":{...}}
```

## Piping and Redirection

### Input Methods

```bash
# Direct prompt argument
gemini "Your prompt"

# Stdin with prompt
echo "code here" | gemini "Review this"

# File input
cat file.txt | gemini "Summarize"
gemini "Analyze" < data.json

# Combined
cat code.py | gemini "Review this Python code for bugs"
```

### Output Redirection

```bash
# Save to file
gemini "Generate report" > report.txt

# Append
gemini "Add more" >> report.txt

# JSON to file
gemini --output-format json "Query" > output.json

# Pipe to jq
gemini --output-format json "Query" | jq '.response'
gemini --output-format json "Query" | jq -r '.stats.models[].tokens.total'
```

## Advanced Patterns

### Batch Processing

```bash
#!/bin/bash
for file in src/*.py; do
  echo "Processing $file..."
  gemini -m gemini-3-pro-preview --output-format json \
    "Review for bugs and security issues" < "$file" \
    > "reports/$(basename "$file" .py).json"
done
```

### Parallel with xargs

```bash
# Process 4 files in parallel
find . -name "*.py" | xargs -P 4 -I {} sh -c \
  'gemini --output-format json "Review" < "{}" > "{}.review.json"'
```

### Error Handling in Scripts

```bash
#!/bin/bash
result=$(gemini --output-format json "Your query" 2>&1)
error=$(echo "$result" | jq -r '.error.message // empty')

if [ -n "$error" ]; then
  echo "Error: $error" >&2
  exit 1
fi

echo "$result" | jq -r '.response'
```

### Stream Processing

```bash
#!/bin/bash
gemini --output-format stream-json "Long task" | while read -r line; do
  type=$(echo "$line" | jq -r '.type')
  case "$type" in
    message)
      echo "Response: $(echo "$line" | jq -r '.content')"
      ;;
    tool_use)
      echo "Using tool: $(echo "$line" | jq -r '.tool')"
      ;;
    error)
      echo "Warning: $(echo "$line" | jq -r '.message')" >&2
      ;;
  esac
done
```

### Commit Message Generator

```bash
#!/bin/bash
diff=$(git diff --cached)
if [ -z "$diff" ]; then
  echo "No staged changes"
  exit 1
fi

message=$(echo "$diff" | gemini --output-format json \
  "Write a concise git commit message for these changes. Return only the message, no explanation." \
  | jq -r '.response')

git commit -m "$message"
```
