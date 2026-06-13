import { MemoryClient } from 'mem0ai';
import { config } from 'dotenv';
config();

// Initialize Mem0 client
const client = new MemoryClient({
  apiKey: process.env.MEM0_API_KEY || '',
});

const USER_ID = 'x-post-agent-user'; // Replace or configure as needed

export async function getIdentityAndPreferences(): Promise<string> {
  if (!process.env.MEM0_API_KEY) {
    console.warn('Mem0 API Key missing.');
    return 'No long-term memories configured.';
  }

  try {
    const { results: memories } = await client.search('My identity, preferences, recurring themes, and writing style', {
      filters: { userId: USER_ID },
    });

    if (!memories || memories.length === 0) {
      return 'No specific identity or preference memories found contextually.';
    }

    return memories
      .map((m: any) => `- ${m.memory}`)
      .join('\n');
  } catch (err) {
    console.error('Failed to fetch from Mem0:', err);
    return 'Error retrieving memories.';
  }
}

export async function addMemory(text: string): Promise<void> {
  if (!process.env.MEM0_API_KEY) return;
  try {
    await client.add([{ role: 'user', content: text }], { userId: USER_ID });
  } catch (err) {
    console.error('Failed to save memory to Mem0:', err);
  }
}
