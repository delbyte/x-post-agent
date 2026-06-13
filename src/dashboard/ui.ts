export const DASHBOARD_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>X Post Agent</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <div class="ambient-glow"></div>
    
    <header class="header-bar">
      <div class="header-content">
        <div class="logo">X Post Agent</div>
        <nav class="pill-nav">
          <button id="tab-runs" class="ghost-tab active">Past runs</button>
          <button id="tab-memories" class="ghost-tab">Memories</button>
        </nav>
        <button id="refresh-btn" class="neutral-filled-btn header-refresh">Refresh</button>
      </div>
    </header>

    <main class="shell">
      <section class="hero">
        <h1>X Post Agent</h1>
        <p class="subtitle">Run the agent, review its drafts, and inspect writing memories.</p>
        <button class="neutral-filled-btn" id="run-button" type="button" style="margin-top: 16px;">Generate a fresh run</button>
      </section>

      <section id="run-result-section" class="hidden" aria-live="polite">
        <div class="frosted-card">
          <h2 class="card-heading">Latest Result</h2>
          <div id="run-result"></div>
        </div>
      </section>

      <div id="runs-view" class="view-section active">
        <div id="runs" aria-live="polite"></div>
      </div>

      <div id="memories-view" class="view-section hidden">
        <div id="memories" aria-live="polite"></div>
      </div>
    </main>

    <script src="/app.js" defer></script>
  </body>
</html>`;

export const DASHBOARD_CSS = `
:root {
  --color-ink-black: #000000;
  --color-snow: #ffffff;
  --color-canvas: #f8f8f8;
  --color-fog: #efefef;
  --color-pebble: #d9d9d9;
  --color-graphite: #636363;
  --color-slate: #959595;
  --color-steel: #aeaeae;
  --color-ash: #7c7c7c;
  --color-spectrum-gradient: linear-gradient(90deg, rgb(198, 121, 196) 0%, rgb(250, 61, 29) 25%, rgb(255, 176, 5) 50%, rgb(225, 225, 254) 75%, rgb(3, 88, 247) 100%);
  
  --font-abc-oracle: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background-color: var(--color-canvas);
  color: var(--color-ink-black);
  font-family: var(--font-abc-oracle);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}

.ambient-glow {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background: var(--color-spectrum-gradient);
  filter: blur(80px);
  opacity: 0.15;
  z-index: -1;
  pointer-events: none;
}

.header-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(239, 239, 239, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: 500;
  font-size: 16px;
  letter-spacing: -0.02em;
}

.pill-nav {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px;
  border-radius: 9999px;
  gap: 4px;
}

.ghost-tab {
  background: transparent;
  color: rgba(0, 0, 0, 0.85);
  border: none;
  border-radius: 9999px;
  padding: 6px 16px;
  font-family: var(--font-abc-oracle);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-tab:hover {
  background: rgba(0,0,0,0.05);
}

.ghost-tab.active {
  background: var(--color-snow);
  box-shadow: var(--shadow-sm);
  color: var(--color-ink-black);
}

.neutral-filled-btn {
  background: var(--color-pebble);
  color: rgba(0, 0, 0, 0.85);
  border: none;
  border-radius: 30px;
  font-family: var(--font-abc-oracle);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 12px 24px;
}

.neutral-filled-btn:hover:not(:disabled) {
  background: var(--color-ink-black);
  color: var(--color-snow);
}

.neutral-filled-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.header-refresh {
  padding: 8px 16px;
}

.shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 120px;
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 54px;
  font-weight: 300;
  letter-spacing: -2.16px;
  line-height: 1.11;
  margin: 0 0 16px 0;
  color: var(--color-ink-black);
  font-family: var(--font-abc-oracle);
}

.subtitle {
  font-size: 18px;
  color: var(--color-graphite);
  margin: 0 0 34px 0;
  max-width: 600px;
}

#run-button {
  font-size: 16px;
}

.view-section {
  display: flex;
  flex-direction: column;
  gap: 40px;
  transition: opacity 0.2s ease;
}

.hidden {
  display: none !important;
}

.frosted-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 30px;
  padding: 32px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 8px 0px;
}

.card-heading {
  font-size: 22px;
  font-weight: 400;
  letter-spacing: -0.44px;
  color: var(--color-ink-black);
  margin: 0 0 24px 0;
}

.run-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--color-fog);
}

.run-time {
  font-size: 14px;
  color: var(--color-graphite);
}

.status {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 10px;
  background: var(--color-fog);
  color: var(--color-graphite);
}

.status.failed {
  background: rgba(250, 61, 29, 0.1);
  color: var(--color-ink-black);
}

.draft-item {
  padding: 0 0 32px 0;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--color-fog);
}
.draft-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.draft-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 10px 0;
}

.draft-content {
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-graphite);
  white-space: pre-wrap;
  margin: 0;
}

.recommendation, .visual {
  margin-top: 15px;
  font-size: 14px;
  color: var(--color-slate);
  background: rgba(0,0,0,0.02);
  padding: 12px 16px;
  border-radius: 10px;
}

.recommendation strong, .visual strong {
  color: var(--color-ink-black);
  font-weight: 500;
}

.history-note {
  font-size: 14px;
  color: var(--color-slate);
  font-style: italic;
}

.memory-text {
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-graphite);
  white-space: pre-wrap;
  margin: 0 0 15px 0;
}

.memory-date {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-slate);
  margin: 0;
}

.state {
  text-align: center;
  padding: 40px;
  color: var(--color-slate);
}

.state.error {
  color: var(--color-ink-black);
}

.spinner {
  width: 24px;
  height: 24px;
  margin: 0 auto 15px;
  border: 2px solid var(--color-pebble);
  border-top-color: var(--color-graphite);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

export const DASHBOARD_JS = `
const runsRoot = document.querySelector('#runs');
const memoriesRoot = document.querySelector('#memories');
const resultRoot = document.querySelector('#run-result');
const resultSection = document.querySelector('#run-result-section');
const runButton = document.querySelector('#run-button');
const refreshBtn = document.querySelector('#refresh-btn');

const tabRuns = document.querySelector('#tab-runs');
const tabMemories = document.querySelector('#tab-memories');
const runsView = document.querySelector('#runs-view');
const memoriesView = document.querySelector('#memories-view');

function switchTab(tab) {
  if (tab === 'runs') {
    tabRuns.classList.add('active');
    tabMemories.classList.remove('active');
    runsView.classList.remove('hidden');
    memoriesView.classList.add('hidden');
  } else {
    tabMemories.classList.add('active');
    tabRuns.classList.remove('active');
    memoriesView.classList.remove('hidden');
    runsView.classList.add('hidden');
  }
}

tabRuns.addEventListener('click', () => switchTab('runs'));
tabMemories.addEventListener('click', () => switchTab('memories'));

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setState(root, kind, message) {
  root.replaceChildren();
  const state = element('div', 'state' + (kind === 'error' ? ' error' : ''));
  if (kind === 'loading') state.append(element('div', 'spinner'));
  state.append(element('div', '', message));
  root.append(state);
}

async function requestJson(path, options) {
  const response = await fetch(path, options);
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The server returned an unreadable response.');
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Request failed with status ' + response.status + '.');
  }
  return payload;
}

function formatDate(value) {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}

function appendDraft(root, draft, historical) {
  const item = element('div', 'draft-item');

  if (draft.kind === 'article' && draft.title) {
    item.append(element('h3', 'draft-title', draft.title));
  }

  const content = element(
    'p',
    'draft-content',
    draft.content || '',
  );
  item.append(content);

  if (draft.recommendation) {
    const recommendation = element('p', 'recommendation');
    recommendation.append(element('strong', '', 'Why this direction: '));
    recommendation.append(document.createTextNode(draft.recommendation));
    item.append(recommendation);
  }

  if (draft.visualSuggestion) {
    const visual = element('p', 'visual');
    visual.append(element('strong', '', 'Visual: '));
    visual.append(document.createTextNode(draft.visualSuggestion));
    item.append(visual);
  }

  root.append(item);
}

function renderRuns(runs) {
  runsRoot.replaceChildren();
  if (!runs.length) {
    setState(runsRoot, 'empty', 'No saved runs yet.');
    return;
  }

  for (const run of runs) {
    const card = element('article', 'frosted-card');
    const meta = element('div', 'run-meta');
    const status = element('span', 'status' + (run.status === 'failed' ? ' failed' : ''), run.status);
    meta.append(element('time', 'run-time', formatDate(run.runDate)), status);
    card.append(meta);

    if (run.drafts && run.drafts.length) {
      for (const draft of run.drafts) appendDraft(card, draft, true);
    } else {
      card.append(element('p', 'history-note', 'No drafts generated.'));
    }
    runsRoot.append(card);
  }
}

function renderMemories(memories) {
  memoriesRoot.replaceChildren();
  
  // Filter out the style profile memories
  const visibleMemories = memories.filter(m => {
    const meta = m.metadata || {};
    return !(meta.kind === 'writing_style_profile' || meta.profileKey);
  });

  if (!visibleMemories.length) {
    setState(memoriesRoot, 'empty', 'No visible memories found.');
    return;
  }

  for (const memory of visibleMemories) {
    const card = element('article', 'frosted-card');
    card.append(element('p', 'memory-text', memory.memory || '(Empty memory)'));
    if (memory.createdAt) card.append(element('p', 'memory-date', formatDate(memory.createdAt)));
    memoriesRoot.append(card);
  }
}

async function loadRuns() {
  setState(runsRoot, 'loading', 'Loading saved runs...');
  try {
    const payload = await requestJson('/api/runs');
    renderRuns(payload.runs || []);
  } catch (error) {
    setState(runsRoot, 'error', error instanceof Error ? error.message : 'Could not load runs.');
  }
}

async function loadMemories() {
  setState(memoriesRoot, 'loading', 'Loading memories...');
  try {
    const payload = await requestJson('/api/memories');
    renderMemories(payload.memories || []);
  } catch (error) {
    setState(memoriesRoot, 'error', error instanceof Error ? error.message : 'Could not load memories.');
  }
}

async function reloadAll() {
  refreshBtn.disabled = true;
  await Promise.all([loadRuns(), loadMemories()]);
  refreshBtn.disabled = false;
}

async function triggerRun() {
  resultSection.classList.remove('hidden');
  setState(resultRoot, 'loading', 'Initializing pipeline...');
  runButton.disabled = true;
  runButton.textContent = 'Running...';

  try {
    const response = await fetch('/api/run', { method: 'POST' });
    if (!response.ok) throw new Error(\`HTTP \$\{response.status\}\`);
    if (!response.body) throw new Error('No response body stream.');

    resultRoot.replaceChildren(); // clear loader
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\\n\\n');
      buffer = lines.pop() ?? ''; // Keep the incomplete part

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = JSON.parse(line.substring(6));

        if (data.type === 'log') {
          const logEl = document.createElement('div');
          logEl.className = 'text-sm text-gray-400 font-mono mb-2';
          logEl.textContent = \`👉 \${data.message}\`;
          resultRoot.appendChild(logEl);
        } else if (data.type === 'done') {
          const drafts = data.drafts || [];
          if (!drafts.length) {
            const el = document.createElement('div');
            el.className = 'text-sm text-yellow-400 mt-4 font-mono';
            el.textContent = 'The run completed without drafts.';
            resultRoot.appendChild(el);
          } else {
            resultRoot.insertAdjacentHTML('beforeend', '<div class="mt-8 border-t border-gray-800 pt-6"></div>');
            for (const draft of drafts) appendDraft(resultRoot, draft, false);
          }
          await loadRuns();
        } else if (data.type === 'error') {
          throw new Error(data.message);
        }
      }
    }
  } catch (error) {
    setState(resultRoot, 'error', error instanceof Error ? error.message : 'The run failed.');
  } finally {
    runButton.disabled = false;
    runButton.textContent = 'Generate a fresh run';
  }
}

runButton.addEventListener('click', triggerRun);
refreshBtn.addEventListener('click', reloadAll);

loadRuns();
loadMemories();
`;
