const STORAGE_KEY = 'taskManager.tasks.v1';

let listeners = [];
let state = {
  tasks: [],
  filters: { search: '', status: 'all', priority: 'all', sortBy: 'created-desc' },
  editingId: null,
};

export const store = {
  getState: () => state,

  subscribe(fn) {
    listeners.push(fn);
    return () => (listeners = listeners.filter((l) => l !== fn));
  },

  emit() { listeners.forEach((l) => l(state)); },

  setTasks(tasks) {
    state.tasks = tasks;
    this.persist();
    this.emit();
  },

  addTask(task) {
    state.tasks.unshift(task);
    this.persist();
    this.emit();
  },

  updateTask(updated) {
    state.tasks = state.tasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
    this.persist();
    this.emit();
  },

  deleteTask(id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    this.persist();
    this.emit();
  },

  setFilter(key, value) {
    state.filters = { ...state.filters, [key]: value };
    this.persist();
    this.emit();
  },

  resetFilters() {
    state.filters = { search: '', status: 'all', priority: 'all', sortBy: 'created-desc' };
    this.persist();
    this.emit();
  },

  setEditing(id) {
    state.editingId = id;
    this.emit();
  },

  /** Derived: tasks after filters + sort */
  getVisibleTasks() {
    const { tasks, filters } = state;
    const { search, status, priority, sortBy } = filters;

    let list = [...tasks];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }
    if (status !== 'all') list = list.filter((t) => t.status === status);
    if (priority !== 'all') list = list.filter((t) => t.priority === priority);

    const priorityWeight = { high: 0, medium: 1, low: 2 };
    const sorters = {
      'created-desc': (a, b) => b.createdAt - a.createdAt,
      'created-asc': (a, b) => a.createdAt - b.createdAt,
      'due-asc': (a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'),
      priority: (a, b) => priorityWeight[a.priority] - priorityWeight[b.priority],
    };
    list.sort(sorters[sortBy] || sorters['created-desc']);

    return list;
  },

  getStats() {
    const t = state.tasks;
    return {
      total: t.length,
      todo: t.filter((x) => x.status === 'todo').length,
      inProgress: t.filter((x) => x.status === 'in-progress').length,
      done: t.filter((x) => x.status === 'done').length,
    };
  },

  persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks: state.tasks, filters: state.filters })
      );
    } catch (e) {
      console.warn('Persist failed:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      state.tasks = data.tasks || [];
      state.filters = { ...state.filters, ...(data.filters || {}) };
      return true;
    } catch {
      return false;
    }
  },
};