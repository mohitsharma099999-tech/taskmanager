import { store } from './store.js';

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isOverdue = (iso, status) => {
  if (!iso || status === 'done') return false;
  return new Date(iso + 'T23:59:59') < new Date();
};

const statusLabel = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

/** Task card component */
export const TaskCard = (task) => {
  const el = document.createElement('article');
  el.className = `task-item priority-${task.priority} status-${task.status}`;
  el.dataset.id = task.id;

  const overdue = isOverdue(task.dueDate, task.status);

  el.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${task.status === 'done' ? 'checked' : ''} title="Mark done" />
    <div class="task-body">
      <div class="task-title">${escapeHtml(task.title)}</div>
      ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
      <div class="task-meta">
        <span class="badge status-${task.status}">${statusLabel[task.status]}</span>
        <span class="badge priority-${task.priority}">${task.priority}</span>
        ${task.dueDate ? `<span class="badge due ${overdue ? 'overdue' : ''}">📅 ${formatDate(task.dueDate)}</span>` : ''}
      </div>
    </div>
    <div class="task-actions">
      <button class="icon-btn edit" title="Edit">✏️</button>
      <button class="icon-btn delete" title="Delete">🗑️</button>
    </div>
  `;

  return el;
};

/** Task list renderer */
export const renderTaskList = (visible) => {
  const listEl = document.getElementById('taskList');
  const emptyEl = document.getElementById('emptyMessage');
  listEl.innerHTML = '';

  if (visible.length === 0) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  const frag = document.createDocumentFragment();
  visible.forEach((t) => frag.appendChild(TaskCard(t)));
  listEl.appendChild(frag);
};

/** Stats renderer */
export const renderStats = () => {
  const s = store.getStats();
  document.getElementById('countAll').textContent = s.total;
  document.getElementById('countTodo').textContent = s.todo;
  document.getElementById('countProgress').textContent = s.inProgress;
  document.getElementById('countDone').textContent = s.done;
};

/** Status indicator */
export const setStatus = (text, kind = 'ok') => {
  const ind = document.getElementById('statusIndicator');
  ind.classList.remove('busy', 'error');
  if (kind === 'busy') ind.classList.add('busy');
  if (kind === 'error') ind.classList.add('error');
  document.getElementById('statusText').textContent = text;
};

/** Loading overlay */
export const setLoading = (on) => {
  document.getElementById('loading').hidden = !on;
};

/** Error banner */
export const showError = (msg, onRetry) => {
  const banner = document.getElementById('errorBanner');
  document.getElementById('errorText').textContent = msg;
  banner.hidden = false;
  const retry = document.getElementById('retryBtn');
  retry.onclick = () => {
    banner.hidden = true;
    onRetry?.();
  };
};

export const hideError = () => {
  document.getElementById('errorBanner').hidden = true;
};