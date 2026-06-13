import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import { desc, inArray } from 'drizzle-orm';
import { db } from '../db';
import { posts, runs } from '../db/schema';
import { generateDrafts } from '../engine/agent';
import { DASHBOARD_CSS, DASHBOARD_HTML, DASHBOARD_JS } from './ui';

const MAX_RUNS = 50;

type MemoryRecord = {
  id: string;
  memory: string;
  createdAt?: string | Date;
  metadata?: Record<string, unknown>;
};

type ContextSummary = {
  githubItems: number | null;
  newsItems: number | null;
  identityLoaded: boolean;
};

type HistoricalDraft = {
  id: number;
  kind: 'post' | 'article';
  title?: string;
  content: string;
  status: string;
  createdAt: Date;
  visualSuggestion: null;
};

function send(
  response: ServerResponse,
  statusCode: number,
  contentType: string,
  body: string,
): void {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': contentType.startsWith('text/html')
      ? 'no-cache'
      : 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  response.end(body);
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  value: unknown,
): void {
  send(
    response,
    statusCode,
    'application/json; charset=utf-8',
    JSON.stringify(value),
  );
}

function sendApiError(
  response: ServerResponse,
  statusCode: number,
  code: string,
  message: string,
): void {
  sendJson(response, statusCode, {
    error: {
      code,
      message,
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function countMatches(value: unknown, pattern: RegExp): number | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  return value.match(pattern)?.length ?? 0;
}

function summarizeContext(context: unknown): ContextSummary {
  if (!isRecord(context)) {
    return {
      githubItems: null,
      newsItems: null,
      identityLoaded: false,
    };
  }

  return {
    githubItems: countMatches(context.github, /^- Priority \d+:/gm),
    newsItems: countMatches(context.news, /^\d+\.\s/gm),
    identityLoaded:
      typeof context.identity === 'string' && context.identity.trim().length > 0,
  };
}

function toHistoricalDraft(row: {
  id: number;
  content: string;
  status: string;
  createdAt: Date;
}): HistoricalDraft {
  const isArticle = row.status === 'article-draft';
  if (!isArticle) {
    return {
      ...row,
      kind: 'post',
      visualSuggestion: null,
    };
  }

  const [title = 'Untitled article', ...bodyParts] = row.content.split('\n\n');
  return {
    id: row.id,
    kind: 'article',
    title: title.trim() || 'Untitled article',
    content: bodyParts.join('\n\n').trim(),
    status: row.status,
    createdAt: row.createdAt,
    visualSuggestion: null,
  };
}

async function getRuns(): Promise<
  Array<{
    id: number;
    runDate: Date;
    status: string;
    contextSummary: ContextSummary;
    drafts: HistoricalDraft[];
  }>
> {
  const runRows = await db
    .select({
      id: runs.id,
      runDate: runs.runDate,
      status: runs.status,
      contextUsed: runs.contextUsed,
    })
    .from(runs)
    .orderBy(desc(runs.runDate), desc(runs.id))
    .limit(MAX_RUNS);

  if (runRows.length === 0) return [];

  const postRows = await db
    .select({
      id: posts.id,
      runId: posts.runId,
      content: posts.content,
      status: posts.status,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(inArray(posts.runId, runRows.map((run) => run.id)))
    .orderBy(desc(posts.createdAt), desc(posts.id));

  const draftsByRun = new Map<number, HistoricalDraft[]>();
  for (const post of postRows) {
    if (post.runId === null) continue;
    const existing = draftsByRun.get(post.runId) ?? [];
    existing.push(toHistoricalDraft(post));
    draftsByRun.set(post.runId, existing);
  }

  return runRows.map((run) => ({
    id: run.id,
    runDate: run.runDate,
    status: run.status,
    contextSummary: summarizeContext(run.contextUsed),
    drafts: draftsByRun.get(run.id) ?? [],
  }));
}

async function getMemories(): Promise<MemoryRecord[]> {
  // This export is supplied by the Mem0 collector integration. Keeping the
  // dynamic import here makes the dashboard independently loadable in tests.
  const memoryModule = (await import('../collectors/mem0')) as unknown as {
    listMemories: () => Promise<MemoryRecord[]>;
  };

  if (typeof memoryModule.listMemories !== 'function') {
    throw new Error('The Mem0 collector does not export listMemories().');
  }

  const memories = await memoryModule.listMemories();
  if (!Array.isArray(memories)) {
    throw new Error('The Mem0 collector returned an invalid memory list.');
  }
  return memories;
}

async function handleApi(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
): Promise<void> {
  try {
    if (pathname === '/api/runs' && request.method === 'GET') {
      sendJson(response, 200, { runs: await getRuns() });
      return;
    }

    if (pathname === '/api/run' && request.method === 'POST') {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      try {
        const drafts = await generateDrafts(async (msg) => {
          response.write(`data: ${JSON.stringify({ type: 'log', message: msg })}\n\n`);
        });
        response.write(`data: ${JSON.stringify({ type: 'done', drafts })}\n\n`);
      } catch (err) {
        response.write(
          `data: ${JSON.stringify({
            type: 'error',
            message: err instanceof Error ? err.message : String(err),
          })}\n\n`,
        );
      } finally {
        response.end();
      }
      return;
    }

    if (pathname === '/api/memories' && request.method === 'GET') {
      sendJson(response, 200, { memories: await getMemories() });
      return;
    }

    if (
      ['/api/runs', '/api/run', '/api/memories'].includes(pathname)
    ) {
      response.setHeader('Allow', pathname === '/api/run' ? 'POST' : 'GET');
      sendApiError(
        response,
        405,
        'METHOD_NOT_ALLOWED',
        'That HTTP method is not supported for this endpoint.',
      );
      return;
    }

    sendApiError(response, 404, 'NOT_FOUND', 'API endpoint not found.');
  } catch (error) {
    console.error(`Dashboard request failed: ${request.method} ${pathname}`, error);
    sendApiError(
      response,
      500,
      'INTERNAL_ERROR',
      pathname === '/api/run'
        ? 'The generation run failed. Check the server logs for details.'
        : 'The dashboard could not load this data. Check the server logs for details.',
    );
  }
}

export function createDashboardServer(): Server {
  return createServer((request, response) => {
    void (async () => {
      const url = new URL(request.url ?? '/', 'http://localhost');
      const pathname = url.pathname;

      if (pathname.startsWith('/api/')) {
        await handleApi(request, response, pathname);
        return;
      }

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.setHeader('Allow', 'GET, HEAD');
        send(response, 405, 'text/plain; charset=utf-8', 'Method Not Allowed');
        return;
      }

      if (pathname === '/') {
        send(response, 200, 'text/html; charset=utf-8', DASHBOARD_HTML);
        return;
      }
      if (pathname === '/styles.css') {
        send(response, 200, 'text/css; charset=utf-8', DASHBOARD_CSS);
        return;
      }
      if (pathname === '/app.js') {
        send(
          response,
          200,
          'text/javascript; charset=utf-8',
          DASHBOARD_JS,
        );
        return;
      }

      send(response, 404, 'text/plain; charset=utf-8', 'Not Found');
    })().catch((error) => {
      console.error('Unhandled dashboard request error:', error);
      if (!response.headersSent) {
        sendApiError(
          response,
          500,
          'INTERNAL_ERROR',
          'The dashboard encountered an unexpected error.',
        );
      } else {
        response.end();
      }
    });
  });
}

export async function startDashboard(): Promise<Server> {
  const parsedPort = Number.parseInt(process.env.PORT ?? process.env.DASHBOARD_PORT ?? '3000', 10);
  const port =
    Number.isInteger(parsedPort) && parsedPort >= 0 && parsedPort <= 65_535
      ? parsedPort
      : 3000;
  const server = createDashboardServer();

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error): void => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = (): void => {
      server.off('error', onError);
      resolve();
    };

    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, '0.0.0.0');
  });

  const address = server.address();
  const activePort =
    address && typeof address === 'object' ? address.port : port;
  console.log(`Dashboard available at http://0.0.0.0:${activePort}`);
  return server;
}

if (require.main === module) {
  void startDashboard().catch((error) => {
    console.error('Failed to start dashboard:', error);
    process.exitCode = 1;
  });
}
