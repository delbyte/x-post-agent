import { kimi } from '../utils/kimi';
import { getRecentGitHubActivity } from '../collectors/github';
import { getIdentityAndPreferences } from '../collectors/mem0';
import { getAINews } from '../collectors/news';
import { db } from '../db';
import { runs, posts } from '../db/schema';

export async function generatePosts() {
  console.log('Starting X Post Agent generation pipeline...');
  
  // 1. Collect Context
  console.log('Collecting context...');
  const [github, identity, news] = await Promise.all([
    getRecentGitHubActivity(),
    getIdentityAndPreferences(),
    getAINews(),
  ]);

  const rawContext = { github, identity, news };
  
  // 2. Generation Engine (Drafting)
  console.log('Drafting posts with Kimi...');
  const draftPrompt = `You are a social media ghostwriter. Your goal is to write 3 Twitter/X post ideas.
Style rules: Keep it short, casual, blunt, funny, and non-corporate.

Context:
Identity & Preferences:
${identity}

GitHub Activity (Yesterday):
${github}

AI News / Trends:
${news}

Instructions: Generate 3 draft tweets based on the context above. Provide the output as a raw string separated by distinct markers: "---TWEET---" between each tweet.`;

  const draftResponse = await kimi.chat.completions.create({
    model: 'moonshot-v1-32k',
    messages: [
      { role: 'system', content: 'You are an edgy, concise, technical builder. No cringe marketing speak.' },
      { role: 'user', content: draftPrompt }
    ],
    temperature: 0.7,
  });

  const draftsText = draftResponse.choices[0].message.content || '';
  
  // 3. Validation Engine (Filtering and Formatting)
  console.log('Validating drafts...');
  const validationPrompt = `Review these 3 draft tweets. 
Rules: They must be short, casual, blunt, funny, and absolutely non-corporate. If any tweet feels too corporate, long, or cringe, rewrite it to be shorter and blunter.

Drafts:
${draftsText}

Output valid JSON strictly in this format: 
{ "tweets": ["tweet 1", "tweet 2", "tweet 3"] }`;

  const validationResponse = await kimi.chat.completions.create({
    model: 'moonshot-v1-8k',
    messages: [
      { role: 'system', content: 'You are a highly critical editor. Only output valid JSON.' },
      { role: 'user', content: validationPrompt }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  });

  let validTweets: string[] = [];
  try {
    const rawResult = JSON.parse(validationResponse.choices[0].message.content || '{}');
    validTweets = rawResult.tweets || [];
  } catch (err) {
    console.error('Failed to parse validated JSON tweets', err);
    // fallback to splitting raw drafts if JSON fails
    validTweets = draftsText.split('---TWEET---').map(t => t.trim()).filter(Boolean).slice(0, 3);
  }

  // Ensure we have exactly 3
  while (validTweets.length < 3) validTweets.push('Agent error: missed generating a valid tweet.');

  // 4. Save to Database
  console.log('Saving to DB...');
  try {
    // Record the run
    const [insertedRun] = await db.insert(runs).values({
      contextUsed: rawContext,
      status: 'success'
    }).returning();

    // Record the posts
    await db.insert(posts).values(
      validTweets.map((t) => ({
        runId: insertedRun.id,
        content: t,
        status: 'draft', // User will review before anything ever goes manual
      }))
    );
    console.log('Saved data to NeonDB successfully.');
  } catch (dbErr) {
    console.error('Failed to save to database. Proceeding to return tweets anyway.', dbErr);
  }

  return validTweets;
}
