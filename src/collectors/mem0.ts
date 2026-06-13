import { MemoryClient, type Memory } from 'mem0ai';
import { config } from 'dotenv';

config();

const client = new MemoryClient({
  apiKey: process.env.MEM0_API_KEY || '',
});

const USER_ID = 'x-post-agent-user';
const STYLE_PROFILE_KEY = 'delbyte-writing-style-v1';

export const DELBYTE_WRITING_STYLE = `Delbyte writing voice:
- Sound like a real person posting a thought immediately, not a brand or content marketer.
- Usually casual, blunt, conversational, and lightly chaotic. Lowercase is natural. Fragments are fine.
- Common energy: "man what is going on", "wtf", "lmao", "cmon", "huh", "aw man", "no shit bro".
- Profanity is allowed when the reaction genuinely calls for it, but never insert it mechanically.
- Lead with the actual reaction or claim. Do not open with throat-clearing, a generic hook, or "here's what I learned".
- Keep short posts short. One sharp thought is often better than a polished mini-essay.
- Technical posts should use specific facts, numbers, timings, tools, or failure modes, then explain them plainly.
- Build posts can say what was made and how long/how many prompts it took, followed by a simple "How I did it:" list when useful.
- News posts should have a real opinion. It is okay to sound confused, annoyed, impressed, relieved, or skeptical.
- Dry humor and self-deprecation are good. Forced jokes are not.
- Avoid hashtags, engagement bait, fake questions, startup slogans, "game changer", "excited to announce", and corporate polish.
- Avoid decorative emoji. Use an emoji only when it is part of the reaction, not as formatting.
- Do not manufacture certainty, outcomes, deployment status, or personal involvement.
- Images are common. Suggest a useful screenshot, chart, product view, quote card, or code/result visual when one would strengthen the post.

Long-form article voice:
- Still sounds like Delbyte, but calmer and more structured.
- Start with the concrete problem or surprising observation, not a grand thesis.
- Explain why it mattered, what was built, how it works, safety/tradeoffs, and what remains unfinished.
- Use short sections and specific evidence. Avoid SEO filler and inflated claims.
- Keep private repository names, links, customer identifiers, internal URLs, secrets, and unnecessary operational details out of public drafts.`;

export type MemorySummary = {
  id: string;
  memory: string;
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
};

function isCanonicalStyleMemory(memory: Memory): boolean {
  return memory.metadata?.profileKey === STYLE_PROFILE_KEY;
}

async function ensureWritingStyleProfile(): Promise<void> {
  if (!process.env.MEM0_API_KEY) return;

  const existing = await client.getAll({
    filters: { user_id: USER_ID },
    pageSize: 100,
    latestOnly: true,
  });

  if (existing.results.some(isCanonicalStyleMemory)) return;

  await client.add(
    [
      {
        role: 'user',
        content: `Remember this as my canonical writing style:\n${DELBYTE_WRITING_STYLE}`,
      },
    ],
    {
      userId: USER_ID,
      infer: false,
      metadata: {
        kind: 'writing_style_profile',
        profileKey: STYLE_PROFILE_KEY,
      },
    },
  );
}

export async function getIdentityAndPreferences(): Promise<string> {
  if (!process.env.MEM0_API_KEY) {
    console.warn('Mem0 API Key missing.');
    return DELBYTE_WRITING_STYLE;
  }

  try {
    await ensureWritingStyleProfile();
    const { results: memories } = await client.search(
      'My identity, writing preferences, corrections, recurring themes, tone, and content preferences',
      {
        filters: { user_id: USER_ID },
        topK: 12,
        latestOnly: true,
      },
    );
    const learnedPreferences = memories
      .filter((memory) => !isCanonicalStyleMemory(memory))
      .map((memory) => memory.memory?.trim())
      .filter((memory): memory is string => Boolean(memory));

    return [
      DELBYTE_WRITING_STYLE,
      learnedPreferences.length > 0
        ? `Mem0 learned preferences:\n${learnedPreferences.map((memory) => `- ${memory}`).join('\n')}`
        : 'Mem0 learned preferences: none yet.',
    ].join('\n\n');
  } catch (error) {
    console.error('Failed to fetch from Mem0:', error);
    return `${DELBYTE_WRITING_STYLE}\n\nMem0 was unavailable for additional preferences.`;
  }
}

export async function addStyleFeedback(text: string): Promise<void> {
  if (!process.env.MEM0_API_KEY || !text.trim()) return;

  try {
    await client.add(
      [
        {
          role: 'user',
          content: `Writing preference feedback: ${text.trim()}`,
        },
      ],
      {
        userId: USER_ID,
        infer: false,
        metadata: {
          kind: 'writing_style_feedback',
        },
      },
    );
  } catch (error) {
    console.error('Failed to save style feedback to Mem0:', error);
    throw error;
  }
}

export async function listMemories(): Promise<MemorySummary[]> {
  if (!process.env.MEM0_API_KEY) return [];

  const result = await client.getAll({
    filters: { user_id: USER_ID },
    pageSize: 100,
    latestOnly: true,
  });

  return result.results
    .map((memory) => ({
      id: memory.id,
      memory: memory.memory?.trim() || '',
      createdAt:
        memory.createdAt instanceof Date
          ? memory.createdAt.toISOString()
          : memory.createdAt
            ? String(memory.createdAt)
            : undefined,
      metadata: memory.metadata,
    }))
    .filter((memory) => memory.memory);
}

export async function addMemory(text: string): Promise<void> {
  if (!process.env.MEM0_API_KEY || !text.trim()) return;

  try {
    await client.add([{ role: 'user', content: text.trim() }], {
      userId: USER_ID,
    });
  } catch (error) {
    console.error('Failed to save memory to Mem0:', error);
  }
}
