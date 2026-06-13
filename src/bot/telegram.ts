import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import { generatePosts } from '../engine/agent';
import { config } from 'dotenv';
config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error('TELEGRAM_BOT_TOKEN is missing. Bot cannot start.');
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Middleware to ensure ONLY the admin can use the bot
bot.use(async (ctx, next) => {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    console.warn('TELEGRAM_ADMIN_CHAT_ID is not configured. Rejecting request.');
    return;
  }
  
  // chat.id is uniquely tied to your Telegram user account in a DM
  if (ctx.chat?.id.toString() !== adminChatId) {
    console.warn(`Unauthorized access attempt from Chat ID: ${ctx.chat?.id}`);
    await ctx.reply('⛔ Unauthorized. This bot is private.');
    return;
  }
  
  return next();
});

// Handler for manual generation trigger
bot.command('run', async (ctx) => {
  await ctx.reply('🚀 Starting X Post Agent pipeline... Gathering context and drafting...');
  try {
    const tweets = await generatePosts();
    for (let i = 0; i < tweets.length; i++) {
        await ctx.reply(`💡 Idea ${i + 1}:\n\n${tweets[i]}`);
    }
    await ctx.reply('✅ Done! Use these as inspiration or reply with feedback (feedback feature pending).');
  } catch (err) {
    console.error(err);
    await ctx.reply('❌ An error occurred while generating posts.');
  }
});

// Setup the daily cron schedule
// e.g. '0 9 * * *' -> every day at 9:00 AM server time
const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';

cron.schedule(schedule, async () => {
    console.log('CRON Triggered: Generating daily posts...');
    
    // In MVP, we might broadcast directly to an admin chat ID if set
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    
    if (adminChatId) {
        try {
            await bot.telegram.sendMessage(adminChatId, '⏰ Daily CRON run started...');
            const tweets = await generatePosts();
            for (let i = 0; i < tweets.length; i++) {
                await bot.telegram.sendMessage(adminChatId, `💡 Idea ${i + 1}:\n\n${tweets[i]}`);
            }
        } catch (err) {
            console.error('Cron generation error', err);
            await bot.telegram.sendMessage(adminChatId, '❌ CRON Error: Failed to generate posts.');
        }
    } else {
        console.warn('TELEGRAM_ADMIN_CHAT_ID not set. Cron ran but cannot notify anyone.');
        // Still runs and saves to DB, but silently
        await generatePosts().catch(e => console.error('Silent cron error', e));
    }
});

// Start the bot using Long Polling
export function startBot() {
  bot.launch();
  console.log('🤖 Telegram bot is running in polling mode.');
  console.log(`⏰ Cron configured with schedule: ${schedule}`);

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
