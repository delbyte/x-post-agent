import OpenAI from 'openai';
import { config } from 'dotenv';
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from 'openai/resources/chat/completions';

config();

const DEFAULT_FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'google/gemma-4-26b-a4b-it:free',
  'openrouter/free',
];

const requestTimeoutMs = Number(process.env.LLM_REQUEST_TIMEOUT_MS) || 25_000;

export const llm = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: requestTimeoutMs,
  maxRetries: 0,
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/delbyte/x-post-agent',
    'X-OpenRouter-Title': 'X Post Agent MVP',
  },
});

export function getFreeModelCandidates(): string[] {
  const configuredModels = [
    process.env.OPENROUTER_MODEL,
    ...(process.env.OPENROUTER_FALLBACK_MODELS?.split(',') ?? []),
  ]
    .map((model) => model?.trim())
    .filter((model): model is string => Boolean(model));

  return [...new Set([...configuredModels, ...DEFAULT_FREE_MODELS])];
}

export async function createFastChatCompletion(
  params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'>,
  validateResponse?: (response: ChatCompletion) => boolean,
  options?: {
    timeoutMs?: number;
  },
): Promise<ChatCompletion> {
  const models = getFreeModelCandidates();
  const timeoutMs = options?.timeoutMs ?? requestTimeoutMs;
  let lastError: unknown;

  for (const model of models) {
    const startedAt = Date.now();
    console.log(`[LLM] Trying ${model}...`);

    try {
      const modelParams = {
        ...params,
        model,
        // Nemotron can spend the entire small output budget on hidden reasoning.
        ...(model.startsWith('nvidia/nemotron') && params.reasoning_effort
          ? { reasoning_effort: 'none' as const }
          : {}),
      };
      const response = await llm.chat.completions.create(
        modelParams,
        {
          maxRetries: 0,
          timeout: timeoutMs,
          signal: AbortSignal.timeout(timeoutMs),
        },
      );

      const message = response.choices[0]?.message;
      const hasContent =
        typeof message?.content === 'string' && message.content.trim().length > 0;
      const hasToolCalls = Boolean(message?.tool_calls?.length);

      if (!message || (!hasContent && !hasToolCalls)) {
        throw new Error('Model returned no completion message.');
      }

      if (validateResponse && !validateResponse(response)) {
        throw new Error('Model returned an invalid completion.');
      }

      console.log(`[LLM] ${model} responded in ${Date.now() - startedAt}ms.`);
      return response;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `[LLM] ${model} failed after ${Date.now() - startedAt}ms: ${message}`,
      );
    }
  }

  throw new Error(`All free OpenRouter models failed: ${models.join(', ')}`, {
    cause: lastError,
  });
}
