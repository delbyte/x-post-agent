import { config } from 'dotenv';
import { db } from '../src/db';
import { runs } from '../src/db/schema';
import { getRecentGitHubActivity } from '../src/collectors/github';
import { getIdentityAndPreferences } from '../src/collectors/mem0';
import { getAINews } from '../src/collectors/news';
import {
  generateDraftIdeas,
  type GeneratedDraft,
} from '../src/engine/agent';
import { getFreeModelCandidates } from '../src/utils/llm';

config();

async function runSmokeTests() {
  console.log('--- SMOKE TESTS STARTED ---');
  let exitCode = 0;
  let github = 'No GitHub context collected.';
  let identity = 'No identity context collected.';

  try {
    // 1. Check Env Vars
    console.log('[1/5] Checking Environment Variables...');
    const reqVars = ['OPENROUTER_API_KEY', 'DATABASE_URL', 'MEM0_API_KEY', 'TELEGRAM_BOT_TOKEN', 'GITHUB_TOKEN', 'GITHUB_USERNAME'];
    const missing = reqVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      console.warn(`Warning: Missing Env Vars: ${missing.join(', ')}`);
    } else {
      console.log('Env vars present.');
    }

    // 2. DB Connectivity
    console.log('[2/5] Testing NeonDB Connectivity...');
    if (process.env.DATABASE_URL) {
      await db.select().from(runs).limit(1);
      console.log('NeonDB connected successfully.');
    } else {
      console.log('Skipping NeonDB test (No URL).');
    }

    // 3. Collectors
    console.log('[3/5] Testing Collectors (Dry Run)...');
    console.log('  -> GitHub...');
    if (process.env.GITHUB_TOKEN) {
      github = await getRecentGitHubActivity();
      console.log(`GitHub returned content length: ${github.length}`);
    } else console.log('Skipping GitHub (No Token).');

    console.log('  -> Mem0...');
    if (process.env.MEM0_API_KEY) {
      identity = await getIdentityAndPreferences();
      console.log(`Mem0 returned content length: ${identity.length}`);
    } else console.log('Skipping Mem0 (No Key).');

    // 4. News and bounded LLM request
    console.log('[4/5] Testing News + fast free LLM...');
    const newsStartedAt = Date.now();
    const news = await getAINews();
    console.log(`News returned ${news.length} chars in ${Date.now() - newsStartedAt}ms.`);

    if (process.env.OPENROUTER_API_KEY) {
      console.log(`  -> Model order: ${getFreeModelCandidates().join(' -> ')}`);
      const llmStartedAt = Date.now();
      const drafts = await generateDraftIdeas({
        github,
        identity,
        news,
      });
      const publicText = drafts
        .map((draft) =>
          draft.kind === 'article'
            ? `${draft.title}\n${draft.content}\n${draft.visualSuggestion}`
            : `${draft.content}\n${draft.visualSuggestion}`,
        )
        .join('\n');
      const unsafePattern =
        /\bPR\s*#?\d+\b|\bwork-\d+\b|\bTier[\s\p{Pd}]?1\b|\bwithzeusai\b|\bPlain\b|\bNotion\b|\bClaude Sonnet\b|github\.com|https?:\/\/|\/(?:api|oauth2)\/|\b\d[\d,]*(?:\.\d+)?\s*(?:tenants?|orgs?|organizations?|customers?|users?|tickets?|attempts?|requests?|incidents?|429s?)\b/iu;
      if (unsafePattern.test(publicText)) {
        throw new Error('Generated publication text contains private source metadata.');
      }

      console.log(
        `LLM generated ${drafts.length} valid drafts in ${Date.now() - llmStartedAt}ms.`,
      );
      drafts.forEach((draft: GeneratedDraft, index: number) => {
        if (draft.kind === 'article') {
          console.log(
            `  ${index + 1}. ARTICLE: ${draft.title} (${draft.content.length} chars)`,
          );
          console.log(`     Visual: ${draft.visualSuggestion}`);
        } else {
          console.log(`  ${index + 1}. POST: ${draft.content}`);
          console.log(`     Visual: ${draft.visualSuggestion}`);
        }
      });
    } else console.log('Skipping LLM / News (No Key).');

    console.log('[5/5] Skipping full Telegram dispatch in smoke script to avoid ghost pings.');
    console.log('--- SMOKE TESTS FINISHED ---');
  } catch (err) {
    console.error('Smoke test failed!', err);
    exitCode = 1;
  } finally {
    process.exit(exitCode);
  }
}

runSmokeTests();
