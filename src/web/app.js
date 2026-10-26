/* DeepSeekHarness-Importer — dashboard UI */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const I18N = {
  en: {
    sessionsTitle: 'Sessions',
    scanning: 'Scanning…',
    source: 'Source',
    moreSources: 'Coming soon:',
    searchPlaceholder: 'Search sessions…',
    filterAll: 'All',
    filterLocal: 'Local',
    filterExport: 'Export',
    subagents: 'Subagents',
    uploadShort: 'Export',
    uploadExport: 'Upload a data export',
    emptyTitle: 'Pick a session',
    emptyBody: 'Your transcripts stay on this machine. Nothing is uploaded.',
    tabConversation: 'Conversation',
    tabStats: 'Stats',
    importTitle: 'Import to DeepSeek Harness',
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
    guide: 'User guide',
    rescan: 'Rescan',
    copyId: 'Copy session id',
    countSessions: (n) => `${n} session${n === 1 ? '' : 's'}`,
    noSessions: 'No sessions match your filters',
    noSessionsHint: 'Clear the search, or upload a data export from the source menu.',
    roleUser: 'Human',
    roleAssistant: 'Assistant',
    moreTurns: (n) => `… ${n} earlier turn${n === 1 ? '' : 's'} not shown`,
    shownAll: 'End of transcript',
    turns: 'turns',
    chars: 'characters',
    tokens: '≈ tokens',
    messages: 'messages',
    tools: 'tool calls',
    project: 'project',
    size: 'size',
    activity: 'last active',
    started: 'started',
    adoptHint: 'Reuses an empty session row, so it appears right away.',
    registerHint: 'Creates a new row. DeepSeek Harness must be restarted once to list it.',
    noSlots: 'No empty slot in this workspace. Create a session in DeepSeek Harness, then rescan — or use “New session”.',
    noWorkspace: 'No DeepSeek Harness workspace found. Open DeepSeek Harness once, then rescan.',
    importDone: 'Imported',
    restartNeeded: 'Restart DeepSeek Harness to see the new session in the sidebar.',
    openIn: 'Open DeepSeek Harness',
    copy: 'Copy id',
    copied: 'Copied',
    importFailed: 'Import failed',
    importBusy: 'Importing…',
    overwriteConfirm: 'Overwrite the existing conversation in this slot?',
    exportUploaded: (n) => `${n} conversation${n === 1 ? '' : 's'} loaded`,
    exportFailed: 'Could not read that file',
    dsh: 'DSH',
    dshMissing: 'not found',
    loading: 'Loading…',
    soon: 'soon',
    dropped: (n) => `${n} dropped`,
  },
  fa: {
    sessionsTitle: 'سشن‌ها',
    scanning: 'در حال اسکن…',
    source: 'منبع',
    moreSources: 'به‌زودی:',
    searchPlaceholder: 'جست‌وجوی سشن…',
    filterAll: 'همه',
    filterLocal: 'محلی',
    filterExport: 'خروجی داده',
    subagents: 'ساب‌ایجنت‌ها',
    uploadShort: 'خروجی',
    uploadExport: 'بارگذاری فایل خروجی داده',
    emptyTitle: 'یک سشن انتخاب کن',
    emptyBody: 'تاریخچه‌ها روی همین سیستم می‌مانند؛ چیزی به بیرون ارسال نمی‌شود.',
    tabConversation: 'گفتگو',
    tabStats: 'آمار',
    importTitle: 'انتقال به DeepSeek Harness',
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
    guide: 'راهنمای کاربر',
    rescan: 'اسکن مجدد',
    copyId: 'کپی شناسه‌ی سشن',
    countSessions: (n) => `${n} سشن`,
    noSessions: 'سشنی با این فیلترها پیدا نشد',
    noSessionsHint: 'جست‌وجو را پاک کن یا از منوی منبع، فایل خروجی داده را بارگذاری کن.',
    roleUser: 'انسان',
    roleAssistant: 'دستیار',
    moreTurns: (n) => `… ${n} نوبت قدیمی‌تر نمایش داده نشده`,
    shownAll: 'پایان گفتگو',
    turns: 'نوبت',
    chars: 'کاراکتر',
    tokens: '≈ توکن',
    messages: 'پیام',
    tools: 'فراخوانی ابزار',
    project: 'پروژه',
    size: 'حجم',
    activity: 'آخرین فعالیت',
    started: 'شروع',
    adoptHint: 'از یک ردیف خالی موجود استفاده می‌کند؛ بلافاصله دیده می‌شود.',
    registerHint: 'ردیف جدید می‌سازد؛ DeepSeek Harness یک بار باید ری‌استارت شود.',
    noSlots: 'این ورک‌اسپیس جای خالی ندارد. در DeepSeek Harness یک سشن بساز و اسکن کن — یا حالت «سشن جدید» را بزن.',
    noWorkspace: 'ورک‌اسپیس DeepSeek Harness پیدا نشد. یک بار آن را باز کن و اسکن مجدد بزن.',
    importDone: 'منتقل شد',
    restartNeeded: 'برای دیدن سشن جدید، DeepSeek Harness را ری‌استارت کن.',
    openIn: 'باز کردن DeepSeek Harness',
    copy: 'کپی شناسه',
    copied: 'کپی شد',
    importFailed: 'انتقال ناموفق',
    importBusy: 'در حال انتقال…',
    overwriteConfirm: 'گفتگوی موجود در این جایگاه بازنویسی شود؟',
    exportUploaded: (n) => `${n} گفتگو خوانده شد`,
    exportFailed: 'خواندن فایل ممکن نشد',
    dsh: 'DSH',
    dshMissing: 'یافت نشد',
    loading: 'در حال بارگذاری…',
    soon: 'به‌زودی',
    dropped: (n) => `${n} حذف‌شده`,
  },
};

const state = {
  lang: localStorage.getItem('di.lang') || 'en',
  theme: localStorage.getItem('di.theme') || 'light',
  status: null,
  sources: [],
  sourceId: 'claude',
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
  loading: true,
};

const t = (key, ...args) => {
  const value = I18N[state.lang][key] ?? I18N.en[key] ?? key;
  return typeof value === 'function' ? value(...args) : value;
};

/* ---------- helpers ---------- */
async function api(path, options) {
  const response = await fetch(path, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `${response.status} ${response.statusText}`);
  return body;
}

const nf = () => new Intl.NumberFormat(state.lang === 'fa' ? 'fa-IR' : 'en-US');
const fmtNumber = (value) => nf().format(value || 0);

function fmtDate(iso, withTime = false) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(state.lang === 'fa' ? 'fa-IR' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const initials = (text) => (text || '?').trim().slice(0, 1).toUpperCase();

function shortProject(session) {
  if (!session) return '';
  if (session.source === 'claude-export') return 'export';
  const hint = session.projectHint || session.project || '';
  const parts = hint.split(/[\\/]/).filter(Boolean);
  return parts.slice(-2).join('/') || session.project || '';
}

function toast(message, kind = 'ok') {
  const node = document.createElement('div');
  node.className = `toast ${kind}`;
  node.textContent = message;
  $('#toasts').append(node);
  setTimeout(() => node.remove(), 4000);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(t('copied'), 'ok');
  } catch {
    /* clipboard may be blocked on http origins */
  }
}

/* ---------- theme / language ---------- */
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem('di.theme', state.theme);
}

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
  $$('.lang button').forEach((button) => button.classList.toggle('active', button.dataset.lang === state.lang));
  localStorage.setItem('di.lang', state.lang);
  renderSourceSelect();
  renderSessions();
  renderDetail();
  renderImportPanel();
  renderStatus();
}

/* ---------- status ---------- */
function renderStatus() {
  if (!state.status) {
    $('#statusRow').innerHTML = '';
    return;
  }
  const { dsh, sources } = state.status;
  const claudeOk = sources.claudeExists;
  $('#statusRow').innerHTML = `
    <span class="status-chip" title="${escapeHtml(sources.claudeRoot)}">
      <span class="dot ${claudeOk ? 'ok' : 'bad'}"></span>
      <b>Claude</b> ${claudeOk ? 'local' : '—'}
    </span>
    <span class="status-chip" title="${escapeHtml(dsh.home)}">
      <span class="dot ${dsh.hasRegistry ? 'ok' : 'bad'}"></span>
      <b>${t('dsh')}</b> ${dsh.hasRegistry ? 'ready' : t('dshMissing')}
    </span>`;
  $('#rootLabel').textContent = sources.claudeRoot;
  $('#rootDot').className = `dot ${claudeOk ? 'ok' : 'bad'}`;
}

/* ---------- source picker ---------- */
function renderSourceSelect() {
  const select = $('#sourceSelect');
  if (!state.sources.length) {
    select.innerHTML = `<option>${t('loading')}</option>`;
    return;
  }
  select.innerHTML = state.sources.map((source) => {
    const label = source.available ? source.label : `${source.label} · ${t('soon')}`;
    return `<option value="${source.id}" ${source.id === state.sourceId ? 'selected' : ''} ${source.available ? '' : 'disabled'}>${escapeHtml(label)}</option>`;
  }).join('');
  const upcoming = state.sources.filter((source) => !source.available).map((source) => source.label);
  $('#sourceHint').textContent = upcoming.length ? `${t('moreSources')} ${upcoming.join(' · ')}` : '';
}

/* ---------- sessions ---------- */
function filteredSessions() {
  const query = state.query.trim().toLowerCase();
  return state.sessions.filter((session) => {
    const isExport = session.source === 'claude-export';
    if (state.filter === 'local' && isExport) return false;
    if (state.filter === 'export' && !isExport) return false;
    if (!query) return true;
    return [session.name, session.project, session.projectHint, session.id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
}

function renderSessions() {
  const list = $('#sessionList');
  const sessions = filteredSessions();
  $('#sessionsMeta').textContent = state.loading ? t('scanning') : t('countSessions', sessions.length);

  if (!sessions.length) {
    list.innerHTML = `<li class="empty-list">
      <strong>${t('noSessions')}</strong>
      <span>${t('noSessionsHint')}</span>
    </li>`;
    return;
  }

  list.innerHTML = sessions.map((session) => {
    const kind = session.source === 'claude-export' ? 'export' : 'local';
    return `<li class="session-item ${session.id === state.selectedId ? 'selected' : ''}"
                data-id="${escapeHtml(session.id)}" data-kind="${kind}">
      <span class="s-avatar">${initials(session.name)}</span>
      <span class="s-main">
        <span class="s-title">${escapeHtml(session.name || session.id)}</span>
        <span class="s-sub">
          <span class="proj" dir="auto">${escapeHtml(shortProject(session))}</span>
          <span class="sep">·</span>
          <span dir="auto">${fmtDate(session.mtime)}</span>
        </span>
      </span>
      <span class="s-side">
        <span class="s-turns">${fmtNumber(session.stats?.turns || 0)}</span>
        <span class="s-turns-label">${t('turns')}</span>
      </span>
    </li>`;
  }).join('');
}

/* ---------- detail ---------- */
function renderDetail() {
  if (!state.detail) {
    $('#emptyState').hidden = false;
    $('#detailBody').hidden = true;
    return;
  }
  $('#emptyState').hidden = true;
  $('#detailBody').hidden = false;

  const session = state.detail.session;
  const isExport = session.source === 'claude-export';
  $('#detailBadges').innerHTML = `
    <span class="badge">${escapeHtml(isExport ? 'Claude export' : 'Claude Code')}</span>
    <span class="badge badge-muted">${escapeHtml(shortProject(session))}</span>`;
  $('#detailTitle').textContent = session.name || session.id;
  $('#detailMeta').innerHTML = [
    `<span><b>${fmtNumber(session.stats.turns)}</b> ${t('turns')}</span>`,
    `<span><b>${fmtNumber(session.stats.chars)}</b> ${t('chars')}</span>`,
    `<span><b>${fmtNumber(session.tokens)}</b> ${t('tokens')}</span>`,
    session.stats.toolCalls ? `<span><b>${fmtNumber(session.stats.toolCalls)}</b> ${t('tools')}</span>` : '',
    `<span dir="auto">${fmtDate(session.mtime)}</span>`,
  ].join('');

  const turns = state.detail.preview?.turns || [];
  const tight = (text) => String(text ?? '').replace(/^[\s\u200b]+/, '').replace(/[\s\u200b]+$/, '');
  $('#chat').innerHTML = turns.map((turn) => `
    <div class="turn">
      <div class="bubble bubble-user" dir="auto"><div class="bubble-role">${t('roleUser')}</div>${escapeHtml(tight(turn.user))}</div>
      <div class="bubble bubble-assistant" dir="auto"><div class="bubble-role">${t('roleAssistant')}</div>${escapeHtml(tight(turn.assistant))}</div>
    </div>`).join('') + `<div class="chat-foot">${
      (state.detail.preview?.totalTurns || 0) > turns.length
        ? t('moreTurns', state.detail.preview.totalTurns - turns.length)
        : t('shownAll')
    }</div>`;

  const stats = [
    [t('turns'), fmtNumber(session.stats.turns)],
    [t('messages'), fmtNumber(session.stats.messages)],
    [t('chars'), fmtNumber(session.stats.chars)],
    [t('tokens'), fmtNumber(session.tokens)],
    [t('tools'), fmtNumber(session.stats.toolCalls)],
    [t('size'), fmtSize(session.sizeBytes)],
    [t('started'), fmtDate(session.firstTimestamp || session.mtime)],
    [t('activity'), fmtDate(session.mtime)],
  ];
  $('#stats').innerHTML = stats.map(([k, v]) => `
    <div class="stat"><div class="stat-k">${escapeHtml(k)}</div><div class="stat-v">${v}</div></div>`).join('');
}

async function selectSession(id) {
  if (!id) return;
  state.selectedId = id;
  renderSessions();
  try {
    state.detail = await api(`/api/sessions/${encodeURIComponent(id)}?source=${encodeURIComponent(state.sourceId)}`);
  } catch (error) {
    toast(`${t('importFailed')}: ${error.message}`, 'err');
    return;
  }
  renderDetail();
  renderImportPanel();
}

/* ---------- import panel ---------- */
const currentWorkspace = () => state.workspaces.find((workspace) => workspace.id === state.workspaceId) || null;
const blankSlots = (workspace) =>
  (workspace?.sessions || []).filter((session) => session.blank || !session.exists);

function renderImportPanel() {
  const workspaceSelect = $('#workspaceSelect');
  workspaceSelect.innerHTML = state.workspaces.length
    ? state.workspaces.map((workspace) => `<option value="${workspace.id}" ${workspace.id === state.workspaceId ? 'selected' : ''}>${escapeHtml(workspace.title)}</option>`).join('')
    : `<option value="">${t('noWorkspace')}</option>`;
  workspaceSelect.disabled = state.workspaces.length === 0;

  const workspace = currentWorkspace();
  const slots = blankSlots(workspace);
  const slotSelect = $('#slotSelect');

  $('#modeHint').textContent = state.mode === 'adopt' ? t('adoptHint') : t('registerHint');

  if (state.mode !== 'adopt') {
    slotSelect.innerHTML = '<option value="">—</option>';
    slotSelect.disabled = true;
  } else if (!slots.length) {
    slotSelect.innerHTML = '<option value="">—</option>';
    slotSelect.disabled = true;
  } else {
    slotSelect.disabled = false;
    slotSelect.innerHTML = slots.map((slot) => {
      const short = slot.id.replace('session-', '').slice(0, 8);
      const label = slot.turns ? `${short} · ${slot.turns} ${t('turns')}` : `${short} · empty`;
      return `<option value="${slot.id}" ${slot.id === state.slotId ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('');
  }

  $('#workspaceHint').textContent = workspace ? workspace.path : t('noWorkspace');

  const warn = $('#warn');
  if (state.mode === 'adopt' && workspace && slots.length === 0) {
    warn.hidden = false;
    $('#warnText').textContent = t('noSlots');
  } else {
    warn.hidden = true;
  }

  const canImport = Boolean(state.detail) && Boolean(workspace) &&
    (state.mode === 'register' || slots.length > 0) && !state.importing;
  const button = $('#importBtn');
  button.disabled = !canImport;
  $('#importBtnLabel').textContent = state.importing ? t('importBusy') : t('importButton');

  const titleInput = $('#titleInput');
  if (!state.detail) {
    titleInput.value = '';
  } else if (!titleInput.dataset.touched) {
    titleInput.value = `Claude import · ${shortProject(state.detail.session).split('/').pop() || 'session'}`;
  }
}

async function importSession() {
  if (!state.detail || !currentWorkspace()) return;
  state.importing = true;
  renderImportPanel();
  const payload = {
    source: state.sourceId,
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
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (String(error.message).includes('already contains a conversation') && confirm(t('overwriteConfirm'))) {
        result = await api('/api/import', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...payload, force: true }),
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
    box.className = 'result is-error';
    box.innerHTML = `
      <div class="result-title">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
        ${t('importFailed')}
      </div>
      <div class="result-rows"><div class="result-row">${escapeHtml(result.error)}</div></div>`;
    return;
  }
  box.className = 'result';
  box.innerHTML = `
    <div class="result-title">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5 5L20 6.5"/></svg>
      ${t('importDone')}
    </div>
    <div class="result-rows">
      <div class="result-row"><span>${t('turns')}</span><b>${fmtNumber(result.stats.turns)}${
        result.stats.droppedTurns ? ` <span class="muted">(${t('dropped', result.stats.droppedTurns)})</span>` : ''
      }</b></div>
      <div class="result-row"><span>${t('tokens')}</span><b>${fmtNumber(result.stats.tokens)}</b></div>
      <div class="result-row"><span>${t('workspace')}</span><b>${escapeHtml(result.workspace.title)}</b></div>
    </div>
    <code>${escapeHtml(result.sessionId)}</code>
    <div class="result-actions">
      <button class="btn btn-xs" id="copyResultBtn">${t('copy')}</button>
      <button class="btn btn-xs" id="openDshBtn">${t('openIn')} ↗</button>
    </div>
    ${result.restartRequired ? `<div class="alert alert-warning" style="margin-top:2px"><span>${t('restartNeeded')}</span></div>` : ''}`;

  $('#copyResultBtn')?.addEventListener('click', () => copyText(result.sessionId));
  $('#openDshBtn')?.addEventListener('click', () => {
    const url = state.status?.dsh?.webUrl || 'http://127.0.0.1:10342';
    window.open(url, '_blank', 'noreferrer');
  });
}

/* ---------- loads ---------- */
async function loadStatus() {
  try {
    state.status = await api('/api/status');
  } catch {
    state.status = null;
  }
  renderStatus();
}

async function loadSources() {
  try {
    const data = await api('/api/sources');
    state.sources = data.sources;
    state.sourceId = data.default;
  } catch {
    state.sources = [];
  }
  renderSourceSelect();
}

async function loadSessions({ fresh = false } = {}) {
  state.loading = true;
  renderSessions();
  try {
    const query = new URLSearchParams({ source: state.sourceId });
    if (state.sidechains) query.set('sidechains', '1');
    if (fresh) query.set('fresh', '1');
    const data = await api(`/api/sessions?${query.toString()}`);
    state.sessions = data.sessions;
  } catch (error) {
    state.sessions = [];
    toast(error.message, 'err');
  } finally {
    state.loading = false;
    renderSessions();
  }
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
  const slots = blankSlots(currentWorkspace());
  if (!slots.some((slot) => slot.id === state.slotId)) state.slotId = slots[0]?.id || '';
  renderImportPanel();
}

/* ---------- events ---------- */
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
    const item = event.target.closest('.session-item');
    if (item) selectSession(item.dataset.id);
  });

  $$('.chip').forEach((chip) => chip.addEventListener('click', () => {
    state.filter = chip.dataset.filter;
    $$('.chip').forEach((other) => other.classList.toggle('active', other === chip));
    renderSessions();
  }));

  $('#sidechains').addEventListener('change', async (event) => {
    state.sidechains = event.target.checked;
    await loadSessions({ fresh: true });
  });

  $('#refreshBtn').addEventListener('click', async () => {
    await Promise.all([loadSessions({ fresh: true }), loadWorkspaces(), loadStatus()]);
    toast(t('countSessions', state.sessions.length), 'ok');
  });

  $('#sourceSelect').addEventListener('change', async (event) => {
    state.sourceId = event.target.value;
    state.selectedId = null;
    state.detail = null;
    renderDetail();
    await loadSessions({ fresh: true });
    if (state.sessions[0]) await selectSession(state.sessions[0].id);
    renderImportPanel();
  });

  $('#themeBtn').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  });

  $$('.lang button').forEach((button) => button.addEventListener('click', () => {
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
    $('#chat').hidden = stats;
    $('#stats').hidden = !stats;
  }));

  $('#uploadBtn').addEventListener('click', () => $('#fileInput').click());
  $('#fileInput').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const json = await file.text();
      const result = await api('/api/export', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ json, source: state.sourceId }),
      });
      toast(t('exportUploaded', result.imported), 'ok');
      await loadSessions({ fresh: true });
      if (state.sessions[0]) await selectSession(state.sessions[0].id);
    } catch (error) {
      toast(`${t('exportFailed')}: ${error.message}`, 'err');
    } finally {
      event.target.value = '';
    }
  });
}

/* ---------- boot ---------- */
const params = new URLSearchParams(location.search);
if (params.get('lang') === 'fa' || params.get('lang') === 'en') state.lang = params.get('lang');
if (params.get('theme') === 'light' || params.get('theme') === 'dark') state.theme = params.get('theme');

applyTheme();
applyLang();
bindEvents();

(async () => {
  await loadStatus();
  await loadSources();
  await Promise.all([loadSessions({ fresh: true }), loadWorkspaces()]);
  const requested = params.get('session');
  const first = requested && state.sessions.some((session) => session.id === requested)
    ? requested
    : state.sessions[0]?.id;
  if (first) await selectSession(first);
})();
