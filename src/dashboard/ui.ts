export const DASHBOARD_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>X Post Agent</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <header class="nav">
      <div class="nav-inner">
        <div class="brand">
          <span class="brand-mark"></span>
          <span class="brand-name">X Post Agent</span>
        </div>
        <nav class="tabs">
          <button id="tab-runs" class="tab active" type="button">Past runs</button>
          <button id="tab-memories" class="tab" type="button">Memories</button>
        </nav>
        <div class="nav-actions">
          <button id="refresh-btn" class="btn-ghost" type="button">Refresh</button>
          <button id="run-button" class="btn-primary" type="button">Generate run</button>
        </div>
      </div>
    </header>

    <main class="shell">
      <section id="run-result-section" class="hidden" aria-live="polite">
        <article class="card">
          <div class="card-head">
            <h2 class="card-title">Latest run</h2>
          </div>
          <div id="run-result" class="run-result"></div>
        </article>
      </section>

      <div id="runs-view" class="view active">
        <div id="runs" aria-live="polite"></div>
      </div>

      <div id="memories-view" class="view hidden">
        <div id="memories" aria-live="polite"></div>
      </div>
    </main>

    <script src="/app.js" defer></script>
  </body>
</html>`;

export const DASHBOARD_CSS = `
:root {
  --color-onyx: #08090a;
  --color-charcoal: #0f1011;
  --color-obsidian: #161718;
  --color-graphite: #23252a;
  --color-iron: #323334;
  --color-steel: #383b3f;
  --color-slate: #62666d;
  --color-fog: #8a8f98;
  --color-mist: #d0d6e0;
  --color-snow: #f7f8f8;
  --color-acid-lime: #e4f222;
  --color-indigo: #5e6ad2;
  --color-emerald: #27a644;
  --color-crimson: #eb5757;
  --color-cyan: #02b8cc;

  --font-inter: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  --shadow-card: rgba(0, 0, 0, 0.4) 0px 2px 4px 0px;
  --shadow-overlay: rgba(8, 9, 10, 0.6) 0px 4px 32px 0px;
  --inset-graphite: inset 0px 0px 0px 1px var(--color-graphite);
}

* { box-sizing: border-box; }

html, body { height: 100%; }

body {
  margin: 0;
  background-color: var(--color-onyx);
  color: var(--color-snow);
  font-family: var(--font-inter);
  font-weight: 400;
  font-feature-settings: "cv01" on, "ss03" on;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* ---------- Top navigation ---------- */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  background: var(--color-charcoal);
  border-bottom: 1px solid var(--color-graphite);
}

.nav-inner {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.brand-mark {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--color-indigo);
  box-shadow: 0 0 8px rgba(94, 106, 210, 0.6);
}

.brand-name {
  font-size: 14px;
  font-weight: 590;
  letter-spacing: -0.01em;
  color: var(--color-snow);
}

.tabs {
  display: flex;
  gap: 4px;
  flex: 1 1 auto;
}

.tab {
  appearance: none;
  background: transparent;
  border: none;
  color: var(--color-fog);
  font-family: var(--font-inter);
  font-size: 14px;
  font-weight: 510;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.tab:hover { color: var(--color-snow); }

.tab.active {
  color: var(--color-snow);
  background: var(--color-obsidian);
  box-shadow: var(--inset-graphite);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.btn-ghost {
  appearance: none;
  background: transparent;
  border: none;
  color: var(--color-fog);
  font-family: var(--font-inter);
  font-size: 14px;
  font-weight: 510;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.btn-ghost:hover:not(:disabled) {
  color: var(--color-snow);
  background: var(--color-obsidian);
}

.btn-ghost:disabled { opacity: 0.5; cursor: wait; }

.btn-primary {
  appearance: none;
  background: var(--color-acid-lime);
  color: #08090a;
  border: none;
  font-family: var(--font-inter);
  font-size: 14px;
  font-weight: 590;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: filter 0.15s ease, opacity 0.15s ease;
}

.btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
.btn-primary:disabled { opacity: 0.55; cursor: wait; }

/* ---------- Shell ---------- */
.shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 96px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hidden { display: none !important; }

/* ---------- Cards ---------- */
.card {
  background: var(--color-charcoal);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-card), var(--inset-graphite);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-graphite);
}

.card-title {
  font-size: 15px;
  font-weight: 590;
  letter-spacing: -0.01em;
  color: var(--color-snow);
  margin: 0;
}

/* ---------- Run meta / status ---------- */
.run-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.run-time {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: -0.015em;
  color: var(--color-fog);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 510;
  letter-spacing: 0.01em;
  text-transform: capitalize;
  padding: 2px 8px;
  border-radius: 2px;
  color: var(--color-mist);
  background: transparent;
}

.status::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-emerald);
}

.status.failed { color: var(--color-crimson); }
.status.failed::before { background: var(--color-crimson); }

/* ---------- Drafts ---------- */
.draft-item {
  padding: 20px 0;
  border-top: 1px solid var(--color-graphite);
}

.draft-item:first-of-type { border-top: none; padding-top: 16px; }
.draft-item:last-child { padding-bottom: 0; }

.draft-title {
  font-size: 15px;
  font-weight: 590;
  letter-spacing: -0.01em;
  color: var(--color-snow);
  margin: 0 0 8px 0;
}

.draft-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-mist);
  white-space: pre-wrap;
  margin: 0;
}

.recommendation, .visual {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-fog);
  background: var(--color-obsidian);
  padding: 10px 12px;
  border-radius: 6px;
  box-shadow: var(--inset-graphite);
}

.recommendation strong, .visual strong {
  color: var(--color-mist);
  font-weight: 590;
}

.history-note {
  font-size: 13px;
  color: var(--color-slate);
  margin: 4px 0 0 0;
}

/* ---------- Memories ---------- */
.memory-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-mist);
  white-space: pre-wrap;
  margin: 0 0 12px 0;
}

.memory-date {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: -0.015em;
  color: var(--color-slate);
  margin: 0;
}

/* ---------- Run log (streaming) ---------- */
.run-result { display: flex; flex-direction: column; }

.log-line {
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: -0.015em;
  color: var(--color-fog);
  padding: 3px 0;
}

.log-divider {
  height: 1px;
  background: var(--color-graphite);
  margin: 16px 0;
}

.log-warning {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-acid-lime);
  margin-top: 12px;
}

/* ---------- States ---------- */
.state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-slate);
  font-size: 14px;
}

.state.error { color: var(--color-crimson); }

.spinner {
  width: 20px;
  height: 20px;
  margin: 0 auto 14px;
  border: 2px solid var(--color-graphite);
  border-top-color: var(--color-fog);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .nav-inner { gap: 12px; padding: 0 16px; }
  .brand-name { display: none; }
  .shell { padding: 24px 16px 80px; }
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
    const card = element('article', 'card');
    const head = element('div', 'card-head');
    const meta = element('div', 'run-meta');
    const status = element('span', 'status' + (run.status === 'failed' ? ' failed' : ''), run.status);
    meta.append(element('time', 'run-time', formatDate(run.runDate)), status);
    head.append(meta);
    card.append(head);

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
    const card = element('article', 'card');
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
          const logEl = element('div', 'log-line', '› ' + data.message);
          resultRoot.appendChild(logEl);
        } else if (data.type === 'done') {
          const drafts = data.drafts || [];
          if (!drafts.length) {
            resultRoot.appendChild(element('div', 'log-warning', 'The run completed without drafts.'));
          } else {
            resultRoot.appendChild(element('div', 'log-divider'));
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
    runButton.textContent = 'Generate run';
  }
}

runButton.addEventListener('click', triggerRun);
refreshBtn.addEventListener('click', reloadAll);

loadRuns();
loadMemories();
`;
