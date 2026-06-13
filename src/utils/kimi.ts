import OpenAI from 'openai';
import { config } from 'dotenv';
config();

export const kimi = new OpenAI({
    apiKey: process.env.KIMI_API_KEY,
    baseURL: process.env.KIMI_API_URL || 'https://api.moonshot.cn/v1',
});
