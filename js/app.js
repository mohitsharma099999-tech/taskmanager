import { api } from './api.js';
import { store } from './store.js';
import { validateTask, showFieldErrors } from './validation.js';
import {
  renderTaskList, renderStats, setStatus, setLoading, showError, hideError,
} from './ui.js';

// ---------- DOM refs ----------
const form = document.getElementById('taskForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEdit');
const taskIdInput = document.getElementById('taskId');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const statusInput = document.getElementById('status');
const priorityInput = document.getElementById('priority');
const dueInput = document.getElementById('dueDate');

const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const sortBy = document.getElementById('sortBy');
const clearFilters = document.getElementById('clearFilters');

// ---------- Render pipeline ----------
const render = () => {
  const visible = store.getVisibleTasks();
  renderTaskList(visible);
  renderStats();
  syncFormWithEditing();
};

const syncFormWithEditing = () => {
  const { editingId, tasks } = store.getState();
  if (editingId) {
    const t = tasks.find((x) => x.id === editingId);
    if (!t) return;
    formTitle.textContent = 'Edit Task';
    submitBtn.textContent = 'Save Changes';
    cancelEditBtn.hidden = false;
    taskIdInput.value = t.id;
    titleInput.value = t.title;
    descInput.value = t.description || '';
    statusInput.value = t.status;
    priorityInput.value = t.priority;
    dueInput.value = t.dueDate || '';
  } else {
    formTitle.textContent = 'Add New Task';
    submitBtn.textContent = 'Add Task';
    cancelEditBtn.hidden = true;
    form.reset();
    taskIdInput.value = '';
  }
};

// ---------- Data load ----------
const loadInitialData = async () => {
  hideError();
  const hasLocal = store.load();

  if (hasLocal && store.getState().tasks.length) {
    setStatus('Loaded from storage', 'ok');
    render();
    return;
  }

  setLoading(true);
  setStatus('Loading…', 'busy');
  try {
    const tasks = await api.getTasks();
    store.setTasks(tasks);
    setStatus('Synced', 'ok');
  } catch (err) {
    setStatus('Offline', 'error');
    showError('Could not reach server. You can still add tasks locally.', loadInitialData);
  } finally {
    setLoading(false);
    render();
  }
};

// ---------- Form submit ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const draft = {
    title: titleInput.value,
    description: descInput.value.trim(),
    status: statusInput.value,
    priority: priorityInput.value,
    dueDate: dueInput.value,
  };

  const { valid, errors } = validateTask(draft);
  showFieldErrors(errors);
  if (!valid) return;

  const editingId = taskIdInput.value;

  try {
    setStatus('Saving…', 'busy');
    if (editingId) {
      await api.updateTask({ id: editingId, ...draft });
      store.updateTask({ id: editingId, ...draft });
      store.setEditing(null);
      setStatus('Updated', 'ok');
    } else {
      const created = await api.createTask(draft);
      store.addTask(created);
      setStatus('Saved', 'ok');
    }
    form.reset();
  } catch (err) {
    setStatus('Save failed', 'error');
    showError(err.message || 'Failed to save task.');
  } finally {
    render();
  }
});

// ---------- Cancel edit ----------
cancelEditBtn.addEventListener('click', () => {
  store.setEditing(null);
  syncFormWithEditing();
});

// ---------- Task list delegation ----------
document.getElementById('taskList').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  const item = e.target.closest('.task-item');
  if (!item) return;
  const id = item.dataset.id;

  // Toggle done
  if (e.target.classList.contains('task-checkbox')) {
    const task = store.getState().tasks.find((t) => t.id === id);
    const nextStatus = e.target.checked ? 'done' : 'todo';
    store.updateTask({ id, status: nextStatus });
    render();
    return;
  }

  if (btn?.classList.contains('edit')) {
    store.setEditing(id);
    syncFormWithEditing();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (btn?.classList.contains('delete')) {
    if (!confirm('Delete this task?')) return;
    await api.deleteTask(id);
    store.deleteTask(id);
    setStatus('Deleted', 'ok');
    render();
  }
});

// ---------- Filters ----------
let searchTimer;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => store.setFilter('search', e.target.value), 150);
});

filterStatus.addEventListener('change', (e) => store.setFilter('status', e.target.value));
filterPriority.addEventListener('change', (e) => store.setFilter('priority', e.target.value));
sortBy.addEventListener('change', (e) => store.setFilter('sortBy', e.target.value));

clearFilters.addEventListener('click', () => {
  store.resetFilters();
  searchInput.value = '';
  filterStatus.value = 'all';
  filterPriority.value = 'all';
  sortBy.value = 'created-desc';
});

// ---------- Subscribe ----------
store.subscribe(() => render());

// ---------- Init ----------
loadInitialData();