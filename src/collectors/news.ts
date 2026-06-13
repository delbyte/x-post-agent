import { config } from 'dotenv';

config();

const NEWS_TIMEOUT_MS = 10_000;
const MAX_HEADLINES = 8;

type NewsItem = {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
};

function decodeXml(value: string): string {
  const entities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"',
  };

  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (match, entity: string) =>
      entities[entity.toLowerCase()] ?? match,
    )
    .replace(/<[^>]+>/g, '')
    .trim();
}

function readTag(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'),
  );
  return match ? decodeXml(match[1]) : '';
}

function parseGoogleNewsRss(xml: string): NewsItem[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  return items
    .map((item) => ({
      title: readTag(item, 'title'),
      source: readTag(item, 'source') || 'Unknown source',
      publishedAt: readTag(item, 'pubDate'),
      url: readTag(item, 'link'),
    }))
    .filter((item) => item.title && item.url)
    .slice(0, MAX_HEADLINES);
}

export async function getAINews(): Promise<string> {
  const feedUrl = new URL('https://news.google.com/rss/search');
  feedUrl.searchParams.set(
    'q',
    '(OpenAI OR Anthropic OR "Google DeepMind" OR "artificial intelligence") when:2d',
  );
  feedUrl.searchParams.set('hl', 'en-US');
  feedUrl.searchParams.set('gl', 'US');
  feedUrl.searchParams.set('ceid', 'US:en');

  try {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'x-post-agent/1.0',
      },
      signal: AbortSignal.timeout(NEWS_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(
        `Google News RSS returned ${response.status} ${response.statusText}`,
      );
    }

    const headlines = parseGoogleNewsRss(await response.text());
    if (headlines.length === 0) {
      return 'No recent AI headlines were found.';
    }

    return [
      'AI headlines from the last 48 hours:',
      ...headlines.map(
        (item, index) =>
          `${index + 1}. ${item.title} | ${item.source} | ${item.publishedAt} | ${item.url}`,
      ),
    ].join('\n');
  } catch (error) {
    console.error('Failed to fetch AI news:', error);
    return 'Recent AI news could not be retrieved.';
  }
}
