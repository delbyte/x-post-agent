import { config } from 'dotenv';

config();

const GITHUB_TIMEOUT_MS = 15_000;
const MAX_SEARCH_RESULTS = 30;
const MAX_CANDIDATE_PULLS = 12;
const MAX_CANDIDATE_COMMITS = 12;
const MAX_DETAILED_WORK_ITEMS = 8;
const MAX_FILES_PER_WORK_ITEM = 8;
const MAX_DESCRIPTION_CHARS = 2_000;

type GitHubCommitSearchItem = {
  sha: string;
  html_url: string;
  repository: {
    full_name: string;
    private: boolean;
  };
  commit: {
    message: string;
    author: { date: string } | null;
    committer: { date: string } | null;
  };
};

type GitHubCommitSearchResponse = {
  items: GitHubCommitSearchItem[];
};

type GitHubIssueSearchItem = {
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  repository_url: string;
};

type GitHubIssueSearchResponse = {
  items: GitHubIssueSearchItem[];
};

type GitHubChangedFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
};

type GitHubCommitDetails = {
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: GitHubChangedFile[];
};

type GitHubPullReference = {
  number: number;
  merged_at: string | null;
};

type GitHubPullDetails = GitHubPullReference & {
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  head: {
    ref: string;
  };
  base: {
    ref: string;
    repo: {
      full_name: string;
      private: boolean;
    };
  };
};

type PullWorkItem = {
  kind: 'pull';
  key: string;
  sizeScore: number;
  pull: GitHubPullDetails;
  files: GitHubChangedFile[];
};

type CommitWorkItem = {
  kind: 'commit';
  key: string;
  sizeScore: number;
  item: GitHubCommitSearchItem;
  detail: GitHubCommitDetails | null;
  pull: GitHubPullDetails | null;
};

type WorkItem = PullWorkItem | CommitWorkItem;

function getAuthoredAt(item: GitHubCommitSearchItem): string {
  return item.commit.author?.date ?? item.commit.committer?.date ?? '';
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function getRepositoryName(repositoryUrl: string): string {
  return repositoryUrl.split('/repos/')[1] ?? '';
}

function getPullKey(repository: string, pullNumber: number): string {
  return `${repository}#${pullNumber}`;
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'x-post-agent/1.0',
  };
}

async function getGitHubJson<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(token),
    signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function getCommitDetails(
  token: string,
  item: GitHubCommitSearchItem,
): Promise<GitHubCommitDetails | null> {
  try {
    return await getGitHubJson<GitHubCommitDetails>(
      token,
      `/repos/${item.repository.full_name}/commits/${item.sha}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `Could not load details for ${item.repository.full_name}@${item.sha.slice(0, 7)}: ${message}`,
    );
    return null;
  }
}

async function getAssociatedPull(
  token: string,
  item: GitHubCommitSearchItem,
): Promise<GitHubPullDetails | null> {
  try {
    const pulls = await getGitHubJson<GitHubPullReference[]>(
      token,
      `/repos/${item.repository.full_name}/commits/${item.sha}/pulls`,
    );
    const pull = pulls.find((candidate) => candidate.merged_at) ?? pulls[0];
    if (!pull) return null;

    return await getGitHubJson<GitHubPullDetails>(
      token,
      `/repos/${item.repository.full_name}/pulls/${pull.number}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `Could not load PR context for ${item.repository.full_name}@${item.sha.slice(0, 7)}: ${message}`,
    );
    return null;
  }
}

async function enrichCommit(
  token: string,
  item: GitHubCommitSearchItem,
): Promise<CommitWorkItem> {
  const [detail, pull] = await Promise.all([
    getCommitDetails(token, item),
    getAssociatedPull(token, item),
  ]);
  const key = pull
    ? getPullKey(pull.base.repo.full_name, pull.number)
    : `${item.repository.full_name}@${item.sha}`;

  return {
    kind: 'commit',
    key,
    sizeScore: pull
      ? pull.additions + pull.deletions
      : (detail?.stats?.total ?? 0),
    item,
    detail,
    pull,
  };
}

async function enrichPull(
  token: string,
  candidate: GitHubIssueSearchItem,
): Promise<PullWorkItem | null> {
  const repository = getRepositoryName(candidate.repository_url);
  if (!repository) return null;

  try {
    const [pull, files] = await Promise.all([
      getGitHubJson<GitHubPullDetails>(
        token,
        `/repos/${repository}/pulls/${candidate.number}`,
      ),
      getGitHubJson<GitHubChangedFile[]>(
        token,
        `/repos/${repository}/pulls/${candidate.number}/files?per_page=${MAX_FILES_PER_WORK_ITEM}`,
      ),
    ]);

    return {
      kind: 'pull',
      key: getPullKey(repository, pull.number),
      sizeScore: pull.additions + pull.deletions,
      pull,
      files,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `Could not load PR ${repository}#${candidate.number}: ${message}`,
    );
    return null;
  }
}

function formatFiles(
  files: GitHubChangedFile[] | undefined,
  totalFiles: number,
): string[] {
  const visibleFiles = files?.slice(0, MAX_FILES_PER_WORK_ITEM) ?? [];
  const lines =
    visibleFiles.length > 0
      ? visibleFiles.map(
          (file) =>
            `    - ${file.filename} (${file.status}, +${file.additions}/-${file.deletions})`,
        )
      : ['    - Changed files unavailable'];
  const omittedFiles = Math.max(0, totalFiles - visibleFiles.length);

  if (omittedFiles > 0) {
    lines.push(`    - ...and ${omittedFiles} more files`);
  }

  return lines;
}

function formatPullWork(item: PullWorkItem, priority: number): string {
  const { pull, files } = item;
  const visibility = pull.base.repo.private ? 'private' : 'public';
  const status = pull.merged_at
    ? 'merged'
    : pull.draft
      ? 'draft'
      : pull.state;

  return [
    `- Priority ${priority}: ${pull.base.repo.full_name} (${visibility})`,
    `  PR #${pull.number} (${status}): ${pull.title}`,
    `  Branch: ${pull.head.ref} -> ${pull.base.ref}`,
    `  Recent activity: created ${pull.created_at}; updated ${pull.updated_at}`,
    `  PR scope: +${pull.additions}/-${pull.deletions}, ${pull.changed_files} files, ${pull.commits} commits`,
    `  Description: ${truncate(pull.body?.trim() || 'No PR description.', MAX_DESCRIPTION_CHARS)}`,
    '  Files:',
    ...formatFiles(files, pull.changed_files),
    `  URL: ${pull.html_url}`,
  ].join('\n');
}

function formatCommitWork(item: CommitWorkItem, priority: number): string {
  const { detail, pull } = item;
  const repository = item.item.repository;
  const visibility = repository.private ? 'private' : 'public';
  const authoredAt = getAuthoredAt(item.item) || 'unknown time';
  const stats = detail?.stats
    ? `+${detail.stats.additions}/-${detail.stats.deletions} across ${detail.stats.total} changed lines`
    : 'change stats unavailable';
  const pullContext = pull
    ? [
        `  Associated PR #${pull.number}: ${pull.title}`,
        `  Branch: ${pull.head.ref} -> ${pull.base.ref}`,
        `  PR scope: +${pull.additions}/-${pull.deletions}, ${pull.changed_files} files, ${pull.commits} commits`,
        `  PR URL: ${pull.html_url}`,
      ]
    : ['  Associated PR: none found'];

  return [
    `- Priority ${priority}: ${repository.full_name} (${visibility})`,
    ...pullContext,
    `  Commit: ${item.item.sha.slice(0, 7)} (${authoredAt})`,
    `  Message: ${truncate(item.item.commit.message.trim(), MAX_DESCRIPTION_CHARS)}`,
    `  Commit scope: ${stats}`,
    '  Files:',
    ...formatFiles(detail?.files, detail?.files?.length ?? 0),
    `  URL: ${item.item.html_url}`,
  ].join('\n');
}

/**
 * Fetches PRs and commits authored by the configured user during the last 24
 * hours. Authenticated search includes private repositories visible to the
 * token.
 */
export async function getRecentGitHubActivity(): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) {
    console.warn('GitHub Configuration missing.');
    return 'No GitHub activity configuration provided.';
  }

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const queryDate = oneDayAgo.toISOString().slice(0, 10);
    const commitQuery = encodeURIComponent(
      `author:${username} author-date:>=${queryDate}`,
    );
    const pullQuery = encodeURIComponent(
      `is:pr author:${username} updated:>=${queryDate}`,
    );

    const [commitData, pullData] = await Promise.all([
      getGitHubJson<GitHubCommitSearchResponse>(
        token,
        `/search/commits?q=${commitQuery}&sort=author-date&order=desc&per_page=${MAX_SEARCH_RESULTS}`,
      ),
      getGitHubJson<GitHubIssueSearchResponse>(
        token,
        `/search/issues?q=${pullQuery}&sort=updated&order=desc&per_page=${MAX_SEARCH_RESULTS}`,
      ),
    ]);

    // GitHub search date qualifiers are day-granular, so enforce the exact
    // rolling 24-hour cutoff after retrieval.
    const recentPullCandidates = pullData.items
      .filter(
        (item) =>
          new Date(item.created_at) >= oneDayAgo ||
          new Date(item.updated_at) >= oneDayAgo,
      )
      .slice(0, MAX_CANDIDATE_PULLS);
    const recentCommits = commitData.items
      .filter((item) => {
        const authoredAt = getAuthoredAt(item);
        return authoredAt && new Date(authoredAt) >= oneDayAgo;
      })
      .slice(0, MAX_CANDIDATE_COMMITS);

    const [pullItems, commitItems] = await Promise.all([
      Promise.all(
        recentPullCandidates.map((candidate) => enrichPull(token, candidate)),
      ),
      Promise.all(recentCommits.map((item) => enrichCommit(token, item))),
    ]);

    const recentPullKeys = new Set(
      pullItems
        .filter((item): item is PullWorkItem => Boolean(item))
        .map((item) => item.key),
    );
    const workItems: WorkItem[] = [
      ...pullItems.filter((item): item is PullWorkItem => Boolean(item)),
      ...commitItems.filter((item) => !recentPullKeys.has(item.key)),
    ];

    if (workItems.length === 0) {
      return 'No GitHub pull requests or commits found in the last 24 hours.';
    }

    const rankedWorkItems = workItems
      .sort((left, right) => right.sizeScore - left.sizeScore)
      .slice(0, MAX_DETAILED_WORK_ITEMS);
    const activitySummary = rankedWorkItems
      .map((item, index) =>
        item.kind === 'pull'
          ? formatPullWork(item, index + 1)
          : formatCommitWork(item, index + 1),
      )
      .join('\n');

    return [
      'GitHub work from the last 24 hours, ranked by approximate PR/commit change size:',
      'Recent PRs are discovered independently of commit timestamps. Larger change size is a relevance hint, not proof that the work is more important.',
      activitySummary,
    ].join('\n');
  } catch (error) {
    console.error('Failed to fetch GitHub activity:', error);
    return 'Failed to retrieve GitHub activity.';
  }
}
