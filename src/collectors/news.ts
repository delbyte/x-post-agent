import { llm } from '../utils/llm';
import { config } from 'dotenv';
config();

export async function getAINews(): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('OpenRouter API Key missing.');
    return 'No AI news context (OpenRouter API missing).';
  }

  try {
    const response = await llm.chat.completions.create({
      model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
      messages: [
        {
          role: 'system',
          content: 'You are an AI researcher. Your task is to provide the top 3 most important AI news developments from the last 48 hours. Please browse the internet if necessary to gather this fresh information and summarize it.'
        },
        {
          role: 'user',
          content: 'What are the top 3 AI news updates from the last 48 hours?'
        }
      ],
      // Moonshot doesn't have an explicit `tools` for browsing natively accessible without specific Moonshot tool integration for normal devs, 
      // but they do support the model automatically searching if instructed in some contexts, or we build a small dummy tool.
      // Assuming regular completion will retrieve up-to-date data if Moonshot has live access.
      temperature: 0.3,
    });

    return `Recent AI News:\n${response.choices[0].message.content || 'None available.'}`;
  } catch (error) {
    console.error('Failed to get AI news from Kimi:', error);
    return 'Error retrieving AI news.';
  }
}
