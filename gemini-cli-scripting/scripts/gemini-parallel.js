#!/usr/bin/env node
/**
 * Gemini CLI Parallel Execution Module
 *
 * Provides functions for making headless Gemini CLI calls,
 * including parallel execution with concurrency control.
 *
 * Usage:
 *   const { callGemini, callGeminiParallel } = require('./gemini-parallel');
 *
 *   // Single call
 *   const result = await callGemini('Your prompt');
 *
 *   // Parallel calls
 *   const results = await callGeminiParallel(['Prompt 1', 'Prompt 2'], {
 *     concurrency: 5,
 *     model: 'gemini-3-pro-preview'
 *   });
 */

const { spawn } = require('child_process');

/**
 * Execute a single Gemini CLI headless call
 * @param {string} prompt - The prompt to send
 * @param {object} options - Configuration options
 * @param {string} options.model - Model ID (default: gemini-3-pro-preview)
 * @param {string} options.outputFormat - Output format (default: json)
 * @param {number} options.timeout - Timeout in ms (default: 60000)
 * @returns {Promise<{prompt: string, response: string, stats: object, error?: string}>}
 */
function callGemini(prompt, options = {}) {
  const {
    model = 'gemini-3-pro-preview',
    outputFormat = 'json',
    timeout = 60000,
  } = options;

  return new Promise((resolve) => {
    const args = ['-m', model, '--output-format', outputFormat, prompt];

    const proc = spawn('gemini', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
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
        resolve({
          prompt,
          response: null,
          stats: null,
          error: stderr || `Process exited with code ${code}`,
        });
        return;
      }

      try {
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          resolve({
            prompt,
            response: parsed.response,
            stats: parsed.stats,
            error: parsed.error || null,
          });
        } else {
          resolve({
            prompt,
            response: stdout.trim(),
            stats: null,
            error: null,
          });
        }
      } catch (e) {
        resolve({
          prompt,
          response: stdout.trim(),
          stats: null,
          error: `JSON parse error: ${e.message}`,
        });
      }
    });

    proc.on('error', (err) => {
      resolve({
        prompt,
        response: null,
        stats: null,
        error: err.message,
      });
    });
  });
}

/**
 * Execute multiple Gemini CLI calls in parallel
 * @param {string[]} prompts - Array of prompts to send
 * @param {object} options - Configuration options
 * @param {number} options.concurrency - Max concurrent calls (default: 5)
 * @param {string} options.model - Model ID (default: gemini-3-pro-preview)
 * @param {number} options.timeout - Timeout per call in ms (default: 60000)
 * @param {function} options.onProgress - Progress callback ({completed, total, latest})
 * @returns {Promise<Array<{prompt, response, stats, error}>>}
 */
async function callGeminiParallel(prompts, options = {}) {
  const {
    concurrency = 5,
    model = 'gemini-3-pro-preview',
    timeout = 60000,
    onProgress,
  } = options;

  const results = [];
  const queue = [...prompts.map((p, i) => ({ prompt: p, index: i }))];
  let completed = 0;

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const result = await callGemini(item.prompt, { model, timeout });
      results[item.index] = result;
      completed++;

      if (onProgress) {
        onProgress({
          completed,
          total: prompts.length,
          latest: result,
        });
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, prompts.length); i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}

module.exports = { callGemini, callGeminiParallel };
