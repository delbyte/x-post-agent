import { config } from 'dotenv';
config();

/**
 * Fetches recent GitHub events for the authenticated requested user to provide context
 * about what they worked on yesterday.
 */
export async function getRecentGitHubActivity(): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) {
    console.warn('GitHub Configuration missing.');
    return 'No GitHub activity configuration provided.';
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const events = (await response.json()) as any[];

    // Filter events from the last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter((e) => new Date(e.created_at) > oneDayAgo);

    if (recentEvents.length === 0) {
      return 'No significant GitHub activity in the last 24 hours.';
    }

    const activitySummary = recentEvents
      .slice(0, 15) // Limit to top 15 to avoid massive context
      .map((e) => {
        if (e.type === 'PushEvent') {
          return `- Pushed to ${e.repo.name}: ${e.payload.commits.map((c: any) => c.message).join(', ')}`;
        }
        if (e.type === 'CreateEvent') {
          return `- Created ${e.payload.ref_type} on ${e.repo.name}`;
        }
        return `- ${e.type} on ${e.repo.name}`;
      })
      .join('\n');

    return `Recent GitHub Activity:\n${activitySummary}`;
  } catch (error) {
    console.error('Failed to fetch GitHub activity:', error);
    return 'Failed to retrieve GitHub activity.';
  }
}
