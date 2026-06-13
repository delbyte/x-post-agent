import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import {
  generateDrafts,
  type GeneratedDraft,
} from '../engine/agent';
import { addStyleFeedback } from '../collectors/mem0';
import { config } from 'dotenv';

config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('TELEGRAM_BOT_TOKEN is missing. Bot cannot start.');
  process.exit(1);
}

const bot = new Telegraf(botToken);
const TELEGRAM_CHUNK_SIZE = 3_800;

function splitMessage(value: string): string[] {
  const chunks: string[] = [];
  let remaining = value.trim();

  while (remaining.length > TELEGRAM_CHUNK_SIZE) {
    const candidate = remaining.slice(0, TELEGRAM_CHUNK_SIZE);
    const splitAt = Math.max(candidate.lastIndexOf('\n\n'), candidate.lastIndexOf('\n'));
    const index = splitAt > TELEGRAM_CHUNK_SIZE / 2 ? splitAt : TELEGRAM_CHUNK_SIZE;
    chunks.push(remaining.slice(0, index).trim());
    remaining = remaining.slice(index).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

function formatDraft(draft: GeneratedDraft, index: number): string {
  if (draft.kind === 'article') {
    return [
      `Article recommendation ${index + 1}`,
      draft.recommendation,
      '',
      draft.title,
      '',
      draft.content,
      '',
      `Visual: ${draft.visualSuggestion}`,
    ].join('\n');
  }

  return [
    `Post idea ${index + 1}`,
    '',
    draft.content,
    '',
    `Visual: ${draft.visualSuggestion}`,
  ].join('\n');
}

async function sendDrafts(
  send: (message: string) => Promise<unknown>,
  drafts: GeneratedDraft[],
): Promise<void> {
  for (let index = 0; index < drafts.length; index += 1) {
    for (const chunk of splitMessage(formatDraft(drafts[index], index))) {
      await send(chunk);
    }
  }
}

bot.use(async (ctx, next) => {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    console.warn('TELEGRAM_ADMIN_CHAT_ID is not configured. Rejecting request.');
    return;
  }

  if (ctx.chat?.id.toString() !== adminChatId) {
    console.warn(`Unauthorized access attempt from Chat ID: ${ctx.chat?.id}`);
    await ctx.reply('Unauthorized. This bot is private.');
    return;
  }

  return next();
});

bot.command('run', async (ctx) => {
  await ctx.reply('Agent workflow triggered...');

  try {
    const statusMsg = await ctx.reply('Initializing...');
    let currentLogs = 'Initializing...';
    
    const drafts = await generateDrafts(async (msg) => {
      currentLogs += `\n👉 ${msg}`;
      // Edit the existing message so we don't spam the chat
      await ctx.telegram.editMessageText(
        ctx.chat?.id,
        statusMsg.message_id,
        undefined,
        currentLogs
      ).catch(() => {}); // ignore 'Message is not modified' error
    });
    
    await sendDrafts((message) => ctx.reply(message), drafts);
    await ctx.reply(
      '✅ Done. Use /style followed by a correction to teach future runs.',
    );
  } catch (error) {
    console.error('Fatal error during /run:', error);
    await ctx.reply(`❌ An error occurred while generating drafts: ${error instanceof Error ? error.message : String(error)}`);
  }
});

bot.command('style', async (ctx) => {
  const feedback = ctx.message.text
    .replace(/^\/style(?:@\w+)?\s*/i, '')
    .trim();

  if (!feedback) {
    await ctx.reply(
      'Usage: /style <feedback>\nExample: /style stop using hashtags and make the first line blunter',
    );
    return;
  }

  try {
    await addStyleFeedback(feedback);
    await ctx.reply('Saved. Future runs will retrieve this writing preference.');
  } catch {
    await ctx.reply('Could not save that preference to Mem0.');
  }
});

const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';

cron.schedule(schedule, async () => {
  console.log('CRON Triggered: Generating daily drafts...');
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (adminChatId) {
    try {
      await bot.telegram.sendMessage(adminChatId, 'Daily draft run started...');
      const drafts = await generateDrafts();
      await sendDrafts(
        (message) => bot.telegram.sendMessage(adminChatId, message),
        drafts,
      );
    } catch (error) {
      console.error('Cron generation error', error);
      await bot.telegram.sendMessage(
        adminChatId,
        'CRON Error: Failed to generate drafts.',
      );
    }
  } else {
    console.warn(
      'TELEGRAM_ADMIN_CHAT_ID not set. Cron ran but cannot notify anyone.',
    );
    await generateDrafts().catch((error) =>
      console.error('Silent cron error', error),
    );
  }
});

export function startBot(): void {
  bot.launch();
  console.log('Telegram bot is running in polling mode.');
  console.log(`Cron configured with schedule: ${schedule}`);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
