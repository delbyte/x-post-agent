import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const runs = pgTable('runs', {
  id: serial('id').primaryKey(),
  runDate: timestamp('run_date').defaultNow().notNull(),
  contextUsed: jsonb('context_used'),
  status: text('status').notNull(), // 'success', 'failed'
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  runId: serial('run_id').references(() => runs.id),
  content: text('content').notNull(),
  status: text('status').notNull(), // 'draft', 'posted', 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  postId: serial('post_id').references(() => posts.id),
  feedbackText: text('feedback_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
