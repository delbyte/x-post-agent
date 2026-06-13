import { config } from 'dotenv';
import { db } from '../src/db';
import { runs } from '../src/db/schema';
import { getRecentGitHubActivity } from '../src/collectors/github';
import { getIdentityAndPreferences } from '../src/collectors/mem0';
import { getAINews } from '../src/collectors/news';
import { kimi } from '../src/utils/kimi';

config();

async function runSmokeTests() {
  console.log('--- 💨 SMOKE TESTS STARTED ---');
  let exitCode = 0;

  try {
    // 1. Check Env Vars
    console.log('[1/5] Checking Environment Variables...');
    const reqVars = ['KIMI_API_KEY', 'DATABASE_URL', 'MEM0_API_KEY', 'TELEGRAM_BOT_TOKEN', 'GITHUB_TOKEN', 'GITHUB_USERNAME'];
    const missing = reqVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      console.warn(`⚠️ Warning: Missing Env Vars: ${missing.join(', ')}`);
    } else {
      console.log('✅ Env vars present.');
    }

    // 2. DB Connectivity
    console.log('[2/5] Testing NeonDB Connectivity...');
    if (process.env.DATABASE_URL) {
      await db.select().from(runs).limit(1);
      console.log('✅ NeonDB connected successfully.');
    } else {
      console.log('⚠️ Skipping NeonDB test (No URL).');
    }

    // 3. Collectors
    console.log('[3/5] Testing Collectors (Dry Run)...');
    console.log('  -> GitHub...');
    if (process.env.GITHUB_TOKEN) {
      const gh = await getRecentGitHubActivity();
      console.log(`✅ GitHub returned content length: ${gh.length}`);
    } else console.log('⚠️ Skipping GitHub (No Token).');

    console.log('  -> Mem0...');
    if (process.env.MEM0_API_KEY) {
      const mem = await getIdentityAndPreferences();
      console.log(`✅ Mem0 returned content length: ${mem.length}`);
    } else console.log('⚠️ Skipping Mem0 (No Key).');

    // 4. News / Kimi Basic Eval
    console.log('[4/5] Testing Kimi / News...');
    if (process.env.KIMI_API_KEY) {
      const news = await getAINews();
      console.log(`✅ Kimi generated News length: ${news.length}`);
    } else console.log('⚠️ Skipping Kimi / News (No Key).');

    console.log('[5/5] Skipping full Telegram dispatch in smoke script to avoid ghost pings.');
    console.log('--- 💨 SMOKE TESTS FINISHED ---');
  } catch (err) {
    console.error('❌ Smoke test failed!', err);
    exitCode = 1;
  } finally {
    process.exit(exitCode);
  }
}

runSmokeTests();
