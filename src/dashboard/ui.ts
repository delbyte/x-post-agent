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
  background: var(--color-indigo);
  color: var(--color-snow);
  border: none;
  font-family: var(--font-inter);
  font-size: 14px;
  font-weight: 590;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: filter 0.15s ease, opacity 0.15s ease;
}

.btn-primary:hover:not(:disabled) { filter: brightness(1.12); }
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

.view { display: flex; flex-direction: column; }

.hidden { display: none !important; }

/* ---------- Latest run card ---------- */
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
  margin-bottom: 16px;
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

/* ---------- Changelog timeline ---------- */
.timeline {
  position: relative;
  margin-left: 4px;
  padding-left: 32px;
  border-left: 1px solid var(--color-graphite);
}

.day { position: relative; padding-bottom: 56px; }
.day:last-child { padding-bottom: 0; }

.day-date {
  position: relative;
  font-size: 15px;
  font-weight: 590;
  letter-spacing: -0.01em;
  color: var(--color-snow);
  margin: 0 0 20px 0;
}

.day-date::before {
  content: "";
  position: absolute;
  left: -32px;
  top: 0.5em;
  transform: translate(-50%, -50%);
  width: 9px;
  height: 9px;
  border-radius: 9999px;
  background: var(--color-slate);
  box-shadow: 0 0 0 4px var(--color-onyx);
}

.day.latest .day-date::before {
  background: var(--color-indigo);
  box-shadow: 0 0 0 4px var(--color-onyx), 0 0 8px rgba(94, 106, 210, 0.6);
}

.run-block { margin-bottom: 28px; }
.run-block:last-child { margin-bottom: 0; }

.run-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.run-tag {
  font-size: 11px;
  font-weight: 590;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--color-mist);
  padding: 2px 8px;
  border-radius: 2px;
  box-shadow: var(--inset-graphite);
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
  text-transform: capitalize;
  color: var(--color-mist);
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

/* ---------- Card grid ---------- */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.empty-run {
  font-size: 13px;
  color: var(--color-slate);
  padding: 4px 0;
}

/* ---------- Post / article card ---------- */
.post-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 300px;
  background: var(--color-obsidian);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--inset-graphite);
  transition: box-shadow 0.15s ease;
}

.post-card:hover {
  box-shadow: inset 0 0 0 1px var(--color-iron);
}

.post-kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--color-slate);
  margin: 0 0 8px 0;
}

.post-title {
  font-size: 15px;
  font-weight: 590;
  line-height: 1.33;
  letter-spacing: -0.01em;
  color: var(--color-snow);
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-body {
  flex: 1 1 auto;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-mist);
  white-space: pre-wrap;
  word-break: break-word;
  padding-right: 6px;
  margin: 0;
}

.post-body strong { color: var(--color-snow); font-weight: 590; }

.post-aside {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--color-graphite);
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-fog);
}

.post-aside strong { color: var(--color-mist); font-weight: 590; }

/* Scrollbar (dark) */
.post-body::-webkit-scrollbar { width: 8px; }
.post-body::-webkit-scrollbar-track { background: transparent; }
.post-body::-webkit-scrollbar-thumb {
  background: var(--color-iron);
  border-radius: 9999px;
  border: 2px solid var(--color-obsidian);
}
.post-body::-webkit-scrollbar-thumb:hover { background: var(--color-steel); }
.post-body { scrollbar-width: thin; scrollbar-color: var(--color-iron) transparent; }

/* Copy on hover */
.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  appearance: none;
  border: none;
  background: var(--color-graphite);
  color: var(--color-mist);
  font-family: var(--font-inter);
  font-size: 11px;
  font-weight: 510;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.15s ease, transform 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.post-card:hover .copy-btn { opacity: 1; transform: translateY(0); }
.copy-btn:hover { background: var(--color-steel); color: var(--color-snow); }
.copy-btn:focus-visible { opacity: 1; outline: 1px solid var(--color-indigo); }
.copy-btn.copied { background: var(--color-emerald); color: #08090a; }

/* ---------- Memories ---------- */
.memory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.memory-card {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  background: var(--color-charcoal);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-card), var(--inset-graphite);
}

.memory-kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--color-slate);
  margin: 0 0 10px 0;
}

.memory-text {
  flex: 1 1 auto;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-mist);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  padding-right: 6px;
}

.memory-text::-webkit-scrollbar { width: 8px; }
.memory-text::-webkit-scrollbar-thumb {
  background: var(--color-iron);
  border-radius: 9999px;
  border: 2px solid var(--color-charcoal);
}
.memory-text { scrollbar-width: thin; scrollbar-color: var(--color-iron) transparent; }

.memory-date {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: -0.015em;
  color: var(--color-slate);
  margin: 12px 0 0 0;
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
  color: var(--color-indigo);
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
@media (max-width: 900px) {
  .cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .nav-inner { gap: 12px; padding: 0 16px; }
  .brand-name { display: none; }
  .shell { padding: 24px 16px 80px; }
  .timeline { padding-left: 24px; }
  .day-date::before { left: -24px; }
  .cards-grid { grid-template-columns: 1fr; }
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

function formatDay(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Unknown date'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date);
}

function dayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'unknown';
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

// Render text with minimal **bold** markdown into a parent, safely (no innerHTML).
function appendRich(parent, text) {
  const parts = String(text || '').split(/(\\*\\*[^*]+\\*\\*)/g);
  for (const part of parts) {
    if (!part) continue;
    if (/^\\*\\*[^*]+\\*\\*$/.test(part)) {
      parent.append(element('strong', '', part.slice(2, -2)));
    } else {
      parent.append(document.createTextNode(part));
    }
  }
}

function copyTextFor(draft) {
  if (draft.kind === 'article' && draft.title) {
    return draft.title + '\\n\\n' + (draft.content || '');
  }
  return draft.content || '';
}

function buildPostCard(draft, index) {
  const card = element('article', 'post-card');

  const copyBtn = element('button', 'copy-btn', 'Copy');
  copyBtn.type = 'button';
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyTextFor(draft));
      copyBtn.textContent = 'Copied';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 1200);
    } catch {
      copyBtn.textContent = 'Failed';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
    }
  });
  card.append(copyBtn);

  const isArticle = draft.kind === 'article';
  card.append(element('p', 'post-kicker', isArticle ? 'Article' : 'Post ' + (index + 1)));

  if (isArticle && draft.title) {
    card.append(element('h3', 'post-title', draft.title));
  }

  const body = element('div', 'post-body');
  appendRich(body, draft.content || '');
  card.append(body);

  if (draft.recommendation || draft.visualSuggestion) {
    const aside = element('div', 'post-aside');
    if (draft.recommendation) {
      const row = element('div');
      row.append(element('strong', '', 'Why: '));
      row.append(document.createTextNode(draft.recommendation));
      aside.append(row);
    }
    if (draft.visualSuggestion) {
      const row = element('div');
      row.append(element('strong', '', 'Visual: '));
      row.append(document.createTextNode(draft.visualSuggestion));
      aside.append(row);
    }
    body.append(aside);
  }

  return card;
}

function buildCardsGrid(drafts) {
  const grid = element('div', 'cards-grid');
  drafts.forEach((draft, index) => grid.append(buildPostCard(draft, index)));
  return grid;
}

function renderRuns(runs) {
  runsRoot.replaceChildren();
  if (!runs.length) {
    setState(runsRoot, 'empty', 'No saved runs yet. Hit "Generate run" to create one.');
    return;
  }

  // Group runs (already newest-first) into calendar days.
  const days = [];
  const byKey = new Map();
  for (const run of runs) {
    const key = dayKey(run.runDate);
    let day = byKey.get(key);
    if (!day) {
      day = { key, runDate: run.runDate, runs: [] };
      byKey.set(key, day);
      days.push(day);
    }
    day.runs.push(run);
  }

  const timeline = element('div', 'timeline');

  days.forEach((day, dayIndex) => {
    const section = element('section', 'day' + (dayIndex === 0 ? ' latest' : ''));
    section.append(element('h2', 'day-date', formatDay(day.runDate)));

    // Oldest run of the day becomes "Run 1".
    const dayRuns = day.runs.slice().reverse();
    const multiple = dayRuns.length > 1;

    dayRuns.forEach((run, runIndex) => {
      const block = element('div', 'run-block');
      const label = element('div', 'run-label');
      if (multiple) label.append(element('span', 'run-tag', 'Run ' + (runIndex + 1)));
      const time = formatTime(run.runDate);
      if (time) label.append(element('span', 'run-time', time));
      label.append(element('span', 'status' + (run.status === 'failed' ? ' failed' : ''), run.status));
      block.append(label);

      if (run.drafts && run.drafts.length) {
        block.append(buildCardsGrid(run.drafts));
      } else {
        block.append(element('p', 'empty-run', 'No drafts generated.'));
      }
      section.append(block);
    });

    timeline.append(section);
  });

  runsRoot.append(timeline);
}

function renderMemories(memories) {
  memoriesRoot.replaceChildren();

  if (!memories.length) {
    setState(memoriesRoot, 'empty', 'No memories stored yet.');
    return;
  }

  const grid = element('div', 'memory-grid');
  for (const memory of memories) {
    const meta = memory.metadata || {};
    const isStyle = meta.kind === 'writing_style_profile' || meta.profileKey;
    const isFeedback = meta.kind === 'writing_style_feedback';
    const kicker = isStyle ? 'Writing style' : isFeedback ? 'Feedback' : 'Memory';

    const card = element('article', 'memory-card');
    card.append(element('p', 'memory-kicker', kicker));
    card.append(element('p', 'memory-text', memory.memory || '(Empty memory)'));
    if (memory.createdAt) card.append(element('p', 'memory-date', formatDay(memory.createdAt)));
    grid.append(card);
  }
  memoriesRoot.append(grid);
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
          resultRoot.appendChild(element('div', 'log-line', '› ' + data.message));
        } else if (data.type === 'done') {
          const drafts = data.drafts || [];
          if (!drafts.length) {
            resultRoot.appendChild(element('div', 'log-warning', 'The run completed without drafts.'));
          } else {
            resultRoot.appendChild(element('div', 'log-divider'));
            resultRoot.appendChild(buildCardsGrid(drafts));
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
