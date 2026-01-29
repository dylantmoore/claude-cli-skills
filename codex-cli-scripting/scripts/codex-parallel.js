/**
 * Codex CLI Parallel Execution Helper
 *
 * Usage:
 *   const { callCodex, callCodexParallel } = require('./codex-parallel');
 *
 *   // Single call
 *   const result = await callCodex('Your prompt');
 *
 *   // Single call with search
 *   const result = await callCodex('Research topic', { search: true });
 *
 *   // Parallel calls
 *   const results = await callCodexParallel(['prompt1', 'prompt2'], {
 *     concurrency: 5,
 *     search: true
 *   });
 */

const { spawn } = require('child_process');

const DEFAULT_MODEL = 'gpt-5.2-xhigh';

/**
 * Execute a single Codex CLI call
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Options
 * @param {string} options.model - Model to use (default: gpt-5.2-xhigh)
 * @param {string} options.cwd - Working directory
 * @param {boolean} options.skipGitCheck - Skip git repo requirement
 * @param {string} options.sandbox - Sandbox mode: read-only, workspace-write, danger-full-access
 * @param {boolean} options.search - Enable web search tool
 * @returns {Promise<{response: string, usage: Object, threadId: string, events: Array}>}
 */
async function callCodex(prompt, options = {}) {
  const {
    model = DEFAULT_MODEL,
    cwd = process.cwd(),
    skipGitCheck = true,
    sandbox = 'read-only',
    search = false,
  } = options;

  return new Promise((resolve, reject) => {
    const args = ['exec', '--json', '-m', model, '-s', sandbox];

    if (skipGitCheck) {
      args.push('--skip-git-repo-check');
    }

    if (search) {
      args.push('--search');
    }

    args.push(prompt);

    const proc = spawn('codex', args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0 && !stdout) {
        reject(new Error(`Codex exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const events = stdout
          .trim()
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));

        const threadStarted = events.find(e => e.type === 'thread.started');
        const itemCompleted = events.filter(e => e.type === 'item.completed');
        const turnCompleted = events.find(e => e.type === 'turn.completed');

        const response = itemCompleted
          .filter(e => e.item?.type === 'agent_message')
          .map(e => e.item.text)
          .join('\n');

        resolve({
          response,
          threadId: threadStarted?.thread_id,
          usage: turnCompleted?.usage || {},
          events,
        });
      } catch (parseError) {
        reject(new Error(`Failed to parse Codex output: ${parseError.message}\nOutput: ${stdout}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to spawn Codex: ${err.message}`));
    });
  });
}

/**
 * Execute multiple Codex calls in parallel with concurrency control
 * @param {string[]} prompts - Array of prompts
 * @param {Object} options - Options
 * @param {number} options.concurrency - Max concurrent calls (default: 5)
 * @param {string} options.model - Model to use
 * @param {boolean} options.search - Enable web search tool
 * @param {Function} options.onProgress - Progress callback ({ completed, total, result })
 * @param {Function} options.onError - Error callback ({ index, prompt, error })
 * @returns {Promise<Array<{response: string, usage: Object}|{error: Error}>>}
 */
async function callCodexParallel(prompts, options = {}) {
  const {
    concurrency = 5,
    model = DEFAULT_MODEL,
    onProgress,
    onError,
    ...callOptions
  } = options;

  const results = new Array(prompts.length);
  let completed = 0;
  let activeCount = 0;
  let nextIndex = 0;

  return new Promise((resolve) => {
    const processNext = async () => {
      while (activeCount < concurrency && nextIndex < prompts.length) {
        const index = nextIndex++;
        const prompt = prompts[index];
        activeCount++;

        callCodex(prompt, { model, ...callOptions })
          .then((result) => {
            results[index] = result;
            completed++;
            if (onProgress) {
              onProgress({ completed, total: prompts.length, index, result });
            }
          })
          .catch((error) => {
            results[index] = { error };
            completed++;
            if (onError) {
              onError({ index, prompt, error });
            }
          })
          .finally(() => {
            activeCount--;
            if (completed === prompts.length) {
              resolve(results);
            } else {
              processNext();
            }
          });
      }
    };

    processNext();
  });
}

module.exports = {
  callCodex,
  callCodexParallel,
  DEFAULT_MODEL,
};
