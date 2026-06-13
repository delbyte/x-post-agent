import OpenAI from 'openai';
import { config } from 'dotenv';
config();

export const llm = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://github.com/delbyte/x-post-agent",
        "X-Title": "X Post Agent MVP"
    }
});
