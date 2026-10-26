/* Claude → DeepSeek Harness Importer — dashboard UI */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const I18N = {
  en: {
    tagline: 'Session importer',
    sessionsTitle: 'Claude sessions',
    sessionsMeta: 'Scanning…',
    searchPlaceholder: 'Search sessions…',
    filterAll: 'All',
    filterCode: 'Claude Code',
    filterExport: 'Export',
    subagents: 'Subagents',
    uploadExport: 'Upload export',
    emptyTitle: 'Pick a session to preview',
    emptyBody: 'Your Claude transcripts stay on this machine. Nothing is uploaded.',
    tabConversation: 'Conversation',
    tabStats: 'Stats',
    importTitle: 'Import to DSH',
    importSubtitle: 'Writes a native, resumable session.',
    workspace: 'Workspace',
    mode: 'Install as',
    modeAdopt: 'Existing slot',
    modeRegister: 'New session',
    slot: 'Target slot',
    budget: 'History budget',
    title: 'Session title',
    titlePlaceholder: 'Claude import · project',
    importButton: 'Import session',
    footerLocal: 'Local-only · no network calls',
    rescan: 'Rescan',
    copyId: 'Copy session id',
    countSessions: (n) => `${n} session${n === 1 ? '' : 's'} found`,
    noSessions: 'No sessions match your filters.',
    noSessionsHint: 'Try clearing the search, or upload a Claude data export.',
    roleUser: 'Human',
    roleAssistant: 'Assistant',
    moreTurns: (n) => `… ${n} earlier turn${n === 1 ? '' : 's'} not shown`,
    shownAll: 'End of transcript',
    turn: 'turn',
    turns: 'turns',
    chars: 'characters',
    tokens: '≈ tokens',
    messages: 'messages',
    tools: 'tool calls',
    project: 'project',
    size: 'size',
    created: 'last active',
    adoptHint: 'Reuses an empty session row, so it appears right away.',
    registerHint: 'Creates a new row. DSH must be restarted once to list it.',
    noSlots: 'This workspace has no empty slot. Open DSH, click “New session” once, then rescan — or use “New session” mode.',
    noWorkspace: 'DSH workspace not found. Open DeepSeek Harness once, then rescan.',
    importDone: 'Imported',
    restartNeeded: 'Restart DeepSeek Harness to see the new session in the sidebar.',
    openIn: 'Open DSH →',
    copy: 'Copy id',
    copied: 'Copied',
    importFailed: 'Import failed',
    importBusy: 'Importing…',
    forceWarning: 'This slot already has a conversation. Importing overwrites it (a backup is kept).',
    overwriteConfirm: 'Overwrite the existing conversation in this slot?',
    exportUploaded: (n) => `${n} conversation${n === 1 ? '' : 's'} loaded from the export`,
    exportFailed: 'Could not read that file',
    dshOk: 'DSH',
    claudeOk: 'Claude',
    dshMissing: 'DSH home missing',
    claudeMissing: 'No Claude data found',
  },
  fa: {
    tagline: 'انتقال سشن',
    sessionsTitle: 'سشن‌های کلاد',
    sessionsMeta: 'در حال اسکن…',
    searchPlaceholder: 'جست‌وجوی سشن…',
    filterAll: 'همه',
    filterCode: 'Claude Code',
    filterExport: 'خروجی داده',
    subagents: 'ساب‌ایجنت‌ها',
    uploadExport: 'بارگذاری فایل خروجی',
    emptyTitle: 'یک سشن را برای پیش‌نمایش انتخاب کن',
    emptyBody: 'تاریخچه‌ها روی همین سیستم می‌مانند؛ چیزی به بیرون ارسال نمی‌شود.',
    tabConversation: 'گفتگو',
    tabStats: 'آمار',
    importTitle: 'انتقال به DSH',
    importSubtitle: 'یک سشن بومی و قابل ادامه می‌سازد.',
    workspace: 'ورک‌اسپیس',
    mode: 'نصب به‌صورت',
    modeAdopt: 'جای خالی موجود',
    modeRegister: 'سشن جدید',
    slot: 'جایگاه هدف',
    budget: 'سقف تاریخچه',
    title: 'عنوان سشن',
    titlePlaceholder: 'Claude import · project',
    importButton: 'انتقال سشن',
    footerLocal: 'کاملاً محلی · بدون تماس شبکه',
    rescan: 'اسکن مجدد',
    copyId: 'کپی شناسه‌ی سشن',
    countSessions: (n) => `${n} سشن پیدا شد`,
    noSessions: 'سشنی با این فیلترها پیدا نشد.',
    noSessionsHint: 'جست‌وجو را پاک کن یا فایل خروجی کلاد را بارگذاری کن.',
    roleUser: 'انسان',
    roleAssistant: 'دستیار',
    moreTurns: (n) => `… ${n} نوبت قدیمی‌تر نمایش داده نشده`,
    shownAll: 'پایان گفتگو',
    turn: 'نوبت',
    turns: 'نوبت',
    chars: 'کاراکتر',
    tokens: '≈ توکن',
    messages: 'پیام',
    tools: 'فراخوانی ابزار',
    project: 'پروژه',
    size: 'حجم',
    created: 'آخرین فعالیت',
    adoptHint: 'از یک ردیف خالی موجود استفاده می‌کند؛ بلافاصله دیده می‌شود.',
    registerHint: 'ردیف جدید می‌سازد؛ برای دیده‌شدن یک بار DSH باید ری‌استارت شود.',
    noSlots: 'این ورک‌اسپیس جای خالی ندارد. در DSH یک بار «New session» بزن و اسکن کن — یا حالت «سشن جدید» را انتخاب کن.',
    noWorkspace: 'ورک‌اسپیس DSH پیدا نشد. یک بار DeepSeek Harness را باز کن و اسکن مجدد بزن.',
    importDone: 'منتقل شد',
    restartNeeded: 'برای دیدن سشن جدید در سایدبار، DeepSeek Harness را ری‌استارت کن.',
    openIn: 'باز کردن DSH ←',
    copy: 'کپی شناسه',
    copied: 'کپی شد',
    importFailed: 'انتقال ناموفق',
    importBusy: 'در حال انتقال…',
    forceWarning: 'این جایگاه از قبل گفتگو دارد. انتقال آن را بازنویسی می‌کند (نسخه‌ی پشتیبان نگه داشته می‌شود).',
    overwriteConfirm: 'گفتگوی موجود در این جایگاه بازنویسی شود؟',
    exportUploaded: (n) => `${n} گفتگو از فایل خروجی خوانده شد`,
    exportFailed: 'خواندن فایل ممکن نشد',
    dshOk: 'DSH',
    claudeOk: 'Claude',
    dshMissing: 'پوشه‌ی DSH پیدا نشد',
    claudeMissing: 'داده‌ای از کلاد پیدا نشد',
  },
};

const state = {
  lang: localStorage.getItem('cdi.lang') || 'en',
  theme: localStorage.getItem('cdi.theme') || 'dark',
  sessions: [],
  workspaces: [],
  selectedId: null,
  detail: null,
  filter: 'all',
  query: '',
  sidechains: false,
  mode: 'adopt',
  workspaceId: '',
  slotId: '',
  importing: false,
};

const t = (key, ...args) => {
  const value = I18N[state.lang][key] ?? I18N.en[key] ?? key;
  return typeof value === 'function' ? value(...args) : value;
};

/* ── helpers ─────────────────────────────────────────────────────── */
const api = async (path, options) => {
  const response = await fetch(path, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `${response.status} ${response.statusText}`);
  return body;
};

const fmtNumber = (value) => new Intl.NumberFormat(state.lang === 'fa' ? 'fa-IR' : 'en-US').format(value || 0);

const fmtDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(state.lang === 'fa' ? 'fa-IR' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(date);
};

const fmtSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const initials = (text) => (text || '?').trim().slice(0, 1).toUpperCase();

function toast(message, kind = 'ok') {
  const node = document.createElement('div');
  node.className = `toast ${kind}`;
  node.textContent = message;
  $('#toasts').append(node);
  setTimeout(() => node.remove(), 4200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(t('copied'));
  } catch {
    /* clipboard may be blocked */
  }
}

/* ── i18n / theme ────────────────────────────────────────────────── */
function applyLang() {
  const html = document.documentElement;
  html.lang = state.lang;
  html.dir = state.lang === 'fa' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach((node) => {
    const value = I18N[state.lang][node.dataset.i18n];
    if (typeof value === 'string') node.textContent = value;
  });
  $$('[data-i18n-placeholder]').forEach((node) => {
    node.placeholder = I18N[state.lang][node.dataset.i18nPlaceholder] || node.placeholder;
  });
  $$('[data-i18n-title]').forEach((node) => {
    node.title = I18N[state.lang][node.dataset.i18nTitle] || '';
  });
  $$('.lang-switch button').forEach((button) => button.classList.toggle('active', button.dataset.lang === state.lang));
  localStorage.setItem('cdi.lang', state.lang);
  renderSessions();
  renderDetail();
  renderImportPanel();
  renderStatus();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem('cdi.theme', state.theme);
}

/* ── status ──────────────────────────────────────────────────────── */
function renderStatus() {
  const status = state.status;
  const pills = [];
  if (status) {
    pills.push(`
      <span class="pill" title="${status.claude.projects}">
        <span class="dot ${status.claude.exists ? 'ok' : 'bad'}"></span>
        <b>${t('claudeOk')}</b>&nbsp;${status.claude.exists ? '~/.claude/projects' : t('claudeMissing')}
      </span>`);
    pills.push(`
      <span class="pill" title="${status.dsh.home}">
        <span class="dot ${status.dsh.hasRegistry ? 'ok' : 'bad'}"></span>
        <b>${t('dshOk')}</b>&nbsp;${status.dsh.hasRegistry ? status.dsh.home : t('dshMissing')}
      </span>`);
  }
  $('#statusPills').innerHTML = pills.join('');
  if (status) $('#claudeRootLabel').textContent = status.claude.projects;
}

/* ── session list ────────────────────────────────────────────────── */
function filteredSessions() {
  const query = state.query.trim().toLowerCase();
  return state.sessions.filter((session) => {
    if (state.filter !== 'all' && session.source !== state.filter) return false;
    if (!query) return true;
    return [session.name, session.project, session.projectHint, session.id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
}

function renderSessions() {
  const list = $('#sessionList');
  const sessions = filteredSessions();
  $('#sessionsMeta').textContent = t('countSessions', sessions.length);
  if (sessions.length === 0) {
    list.innerHTML = `
      <li class="empty-state" style="padding:32px 16px">
        <div class="empty-glyph">◌</div>
        <h3>${t('noSessions')}</h3>
        <p class="muted">${t('noSessionsHint')}</p>
      </li>`;
    return;
  }
  list.innerHTML = sessions.map((session) => `
    <li class="session-card ${session.id === state.selectedId ? 'active' : ''}" data-id="${session.id}" data-source="${session.source}">
      <div class="avatar">${initials(session.name)}</div>
      <div class="session-main">
        <div class="session-name" dir="auto">${escapeHtml(session.name || session.id)}</div>
        <div class="session-sub">
          <span class="proj" dir="auto">${escapeHtml(shortProject(session))}</span>
          <span class="sep">·</span>
          <span dir="auto">${fmtDate(session.mtime)}</span>
        </div>
      </div>
      <div class="session-side">
        <div class="turns">${fmtNumber(session.stats?.turns || 0)}</div>
        <div>${t('turns')}</div>
      </div>
    </li>`).join('');
}

function shortProject(session) {
  if (session.source === 'claude-export') return 'export';
  const hint = session.projectHint || session.project || '';
  const parts = hint.split(/[\\/]/).filter(Boolean);
  return parts.slice(-2).join('/') || session.project;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

/* ── detail ──────────────────────────────────────────────────────── */
function renderDetail() {
  const detail = state.detail;
  if (!detail) {
    $('#emptyState').hidden = false;
    $('#detailBody').hidden = true;
    return;
  }
  $('#emptyState').hidden = true;
  $('#detailBody').hidden = false;
  const session = detail.session;
  $('#detailTitle').textContent = session.name || session.id;
  $('#detailMeta').innerHTML = [
    `<span><b>${fmtNumber(session.stats.turns)}</b> ${t('turns')}</span>`,
    `<span><b>${fmtNumber(session.stats.chars)}</b> ${t('chars')}</span>`,
    `<span><b>${fmtNumber(session.tokens)}</b> ${t('tokens')}</span>`,
    session.stats.toolCalls ? `<span><b>${fmtNumber(session.stats.toolCalls)}</b> ${t('tools')}</span>` : '',
    `<span>${escapeHtml(shortProject(session))}</span>`,
    `<span dir="auto">${fmtDate(session.mtime)}</span>`,
  ].join('');

  const transcript = $('#transcript');
  const turns = detail.preview.turns || [];
  transcript.innerHTML = turns.map((turn) => `
    <div class="turn">
      <div class="msg user" dir="auto">
        <div class="msg-role">${t('roleUser')}</div>${escapeHtml(turn.user)}
      </div>
      <div class="msg assistant" dir="auto">
        <div class="msg-role">${t('roleAssistant')}</div>${escapeHtml(turn.assistant)}
      </div>
    </div>`).join('') + `
    <div class="transcript-foot">
      ${detail.preview.totalTurns > turns.length ? t('moreTurns', detail.preview.totalTurns - turns.length) : t('shownAll')}
    </div>`;

  $('#statsGrid').innerHTML = [
    ['turns', fmtNumber(session.stats.turns)],
    ['messages', fmtNumber(session.stats.messages)],
    ['chars', fmtNumber(session.stats.chars)],
    ['tokens', fmtNumber(session.tokens)],
    ['tools', fmtNumber(session.stats.toolCalls)],
    ['size', fmtSize(session.sizeBytes)],
    ['created', fmtDate(session.firstTimestamp || session.mtime)],
    ['project', escapeHtml(shortProject(session))],
  ].map(([key, value]) => `
    <div class="stat"><div class="k">${t(key)}</div><div class="v">${value}</div></div>`).join('');
}

async function selectSession(id) {
  if (!id) return;
  state.selectedId = id;
  renderSessions();
  try {
    state.detail = await api(`/api/sessions/${encodeURIComponent(id)}`);
  } catch (error) {
    toast(`${t('importFailed')}: ${error.message}`, 'err');
    return;
  }
  renderDetail();
  renderImportPanel();
}

/* ── import panel ────────────────────────────────────────────────── */
function currentWorkspace() {
  return state.workspaces.find((workspace) => workspace.id === state.workspaceId) || null;
}

function blankSlots(workspace) {
  if (!workspace) return [];
  return workspace.sessions.filter((session) => session.blank || !session.exists);
}

function renderImportPanel() {
  const workspaceSelect = $('#workspaceSelect');
  if (state.workspaces.length === 0) {
    workspaceSelect.innerHTML = `<option value="">${t('noWorkspace')}</option>`;
  } else {
    workspaceSelect.innerHTML = state.workspaces.map((workspace) =>
      `<option value="${workspace.id}" ${workspace.id === state.workspaceId ? 'selected' : ''}>${escapeHtml(workspace.title)} — ${escapeHtml(workspace.path)}</option>`).join('');
  }

  const workspace = currentWorkspace();
  const slots = blankSlots(workspace);
  const slotSelect = $('#slotSelect');
  const slotHint = $('#slotHint');
  const modeHint = $('#modeHint');
  modeHint.textContent = state.mode === 'adopt' ? t('adoptHint') : t('registerHint');

  if (state.mode !== 'adopt') {
    slotSelect.innerHTML = '<option value="">—</option>';
    slotSelect.disabled = true;
    slotHint.textContent = '';
  } else if (slots.length === 0) {
    slotSelect.innerHTML = '<option value="">—</option>';
    slotSelect.disabled = true;
    slotHint.textContent = '';
  } else {
    slotSelect.disabled = false;
    slotSelect.innerHTML = slots.map((slot) => `<option value="${slot.id}" ${slot.id === state.slotId ? 'selected' : ''}>${slot.id.replace('session-', '').slice(0, 8)}${slot.turns ? ` · ${slot.turns} turns` : ' · empty'}</option>`).join('');
    slotHint.textContent = '';
  }

  $('#workspaceHint').textContent = workspace ? workspace.path : t('noWorkspace');
  $('#slotField').hidden = state.mode !== 'adopt';

  const warn = $('#warn');
  if (state.mode === 'adopt' && workspace && slots.length === 0) {
    warn.hidden = false;
    warn.textContent = t('noSlots');
  } else {
    warn.hidden = true;
  }

  const busy = state.importing;
  const canImport = !!state.detail && !!workspace && (state.mode === 'register' || slots.length > 0) && !busy;
  const button = $('#importBtn');
  button.disabled = !canImport;
  button.classList.toggle('busy', busy);
  $('span', button).textContent = busy ? t('importBusy') : t('importButton');

  if (!state.detail) {
    $('#titleInput').value = '';
  } else if (!$('#titleInput').dataset.touched) {
    const project = shortProject(state.detail.session).split('/').pop();
    $('#titleInput').value = `Claude import · ${project || 'session'}`;
  }
}

async function importSession() {
  if (!state.detail || !currentWorkspace()) return;
  state.importing = true;
  renderImportPanel();
  const body = {
    sessionId: state.detail.session.id,
    workspaceId: state.workspaceId,
    mode: state.mode,
    targetSessionId: state.mode === 'adopt' ? $('#slotSelect').value : undefined,
    maxChars: Number($('#maxChars').value),
    title: $('#titleInput').value.trim(),
  };
  try {
    let result;
    try {
      result = await api('/api/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (String(error.message).includes('already contains a conversation') && confirm(t('overwriteConfirm'))) {
        result = await api('/api/import', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...body, force: true }),
        });
      } else {
        throw error;
      }
    }
    showResult(result);
    await loadWorkspaces();
  } catch (error) {
    showResult({ error: error.message });
    toast(`${t('importFailed')}: ${error.message}`, 'err');
  } finally {
    state.importing = false;
    renderImportPanel();
  }
}

function showResult(result) {
  const box = $('#result');
  box.hidden = false;
  if (result.error) {
    box.className = 'result error';
    box.innerHTML = `<h4>${t('importFailed')}</h4><div class="muted">${escapeHtml(result.error)}</div>`;
    return;
  }
  box.className = 'result';
  box.innerHTML = `
    <h4>✓ ${t('importDone')}</h4>
    <div class="row"><span>${t('turns')}</span><span>${fmtNumber(result.stats.turns)}${result.stats.droppedTurns ? ` (+${result.stats.droppedTurns} dropped)` : ''}</span></div>
    <div class="row"><span>${t('tokens')}</span><span>${fmtNumber(result.stats.tokens)}</span></div>
    <div class="row"><span>id</span><code>${escapeHtml(result.sessionId)}</code></div>
    <div class="actions">
      <button id="copyResultBtn">${t('copy')}</button>
      <button id="openDshBtn">${t('openIn')} ${escapeHtml(result.workspace.title)}</button>
    </div>
    ${result.restartRequired ? `<div class="warn" style="margin:4px 0 0">${t('restartNeeded')}</div>` : ''}`;
  $('#copyResultBtn').addEventListener('click', () => copyText(result.sessionId));
  $('#openDshBtn').addEventListener('click', () => openDsh(result.workspace.path));
}

function openDsh(workspacePath) {
  const status = state.status;
  const base = status?.dsh?.webUrl || 'http://127.0.0.1:10342';
  window.open(base, '_blank', 'noreferrer');
}

/* ── data loading ────────────────────────────────────────────────── */
async function loadStatus() {
  try {
    state.status = await api('/api/status');
  } catch {
    state.status = null;
  }
  renderStatus();
}

async function loadSessions() {
  const query = state.sidechains ? '?sidechains=1' : '';
  const data = await api(`/api/sessions${query}`);
  state.sessions = data.sessions;
  renderSessions();
}

async function loadWorkspaces() {
  try {
    const data = await api('/api/workspaces');
    state.workspaces = data.workspaces || [];
  } catch {
    state.workspaces = [];
  }
  if (!state.workspaces.some((workspace) => workspace.id === state.workspaceId)) {
    state.workspaceId = state.workspaces[0]?.id || '';
  }
  const workspace = currentWorkspace();
  const slots = blankSlots(workspace);
  if (!slots.some((slot) => slot.id === state.slotId)) state.slotId = slots[0]?.id || '';
  renderImportPanel();
}

/* ── events ──────────────────────────────────────────────────────── */
function bindEvents() {
  $('#search').addEventListener('input', (event) => {
    state.query = event.target.value;
    renderSessions();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      event.preventDefault();
      $('#search').focus();
    }
    if (event.key === 'Escape') $('#search').blur();
  });

  $('#sessionList').addEventListener('click', (event) => {
    const card = event.target.closest('.session-card');
    if (card) selectSession(card.dataset.id);
  });

  $$('.chip').forEach((chip) => chip.addEventListener('click', () => {
    state.filter = chip.dataset.filter;
    $$('.chip').forEach((other) => other.classList.toggle('active', other === chip));
    renderSessions();
  }));

  $('#sidechains').addEventListener('change', async (event) => {
    state.sidechains = event.target.checked;
    await loadSessions();
  });

  $('#refreshBtn').addEventListener('click', async () => {
    await Promise.all([loadSessions(), loadWorkspaces(), loadStatus()]);
    toast(t('countSessions', state.sessions.length));
  });

  $('#themeBtn').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  });

  $$('.lang-switch button').forEach((button) => button.addEventListener('click', () => {
    state.lang = button.dataset.lang;
    applyLang();
  }));

  $('#workspaceSelect').addEventListener('change', (event) => {
    state.workspaceId = event.target.value;
    state.slotId = '';
    renderImportPanel();
  });

  $('#slotSelect').addEventListener('change', (event) => {
    state.slotId = event.target.value;
  });

  $$('.seg').forEach((segment) => segment.addEventListener('click', () => {
    state.mode = segment.dataset.mode;
    $$('.seg').forEach((other) => other.classList.toggle('active', other === segment));
    renderImportPanel();
  }));

  $('#importBtn').addEventListener('click', importSession);

  $('#copyIdBtn').addEventListener('click', () => {
    if (state.detail) copyText(state.detail.session.id);
  });

  $('#titleInput').addEventListener('input', (event) => {
    event.target.dataset.touched = '1';
  });

  $$('.tab').forEach((tab) => tab.addEventListener('click', () => {
    $$('.tab').forEach((other) => other.classList.toggle('active', other === tab));
    const stats = tab.dataset.view === 'stats';
    $('#transcript').hidden = stats;
    $('#statsGrid').hidden = !stats;
  }));

  $('#uploadBtn').addEventListener('click', () => $('#fileInput').click());
  $('#fileInput').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = await api('/api/export', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ json: text }),
      });
      toast(t('exportUploaded', result.imported));
      await loadSessions();
    } catch (error) {
      toast(`${t('exportFailed')}: ${error.message}`, 'err');
    } finally {
      event.target.value = '';
    }
  });
}

/* ── boot ────────────────────────────────────────────────────────── */
const params = new URLSearchParams(location.search);
if (params.get('lang') === 'fa' || params.get('lang') === 'en') state.lang = params.get('lang');
if (params.get('theme') === 'light' || params.get('theme') === 'dark') state.theme = params.get('theme');

applyTheme();
applyLang();
bindEvents();
renderSessions();

(async () => {
  await loadStatus();
  await Promise.all([loadSessions(), loadWorkspaces()]);
  const requested = params.get('session');
  const first = requested && state.sessions.some((session) => session.id === requested) ? requested : state.sessions[0]?.id;
  if (first) await selectSession(first);
})();

