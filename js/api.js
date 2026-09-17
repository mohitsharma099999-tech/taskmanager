

const BASE_URL = 'https://jsonplaceholder.typicode.com';
const TIMEOUT = 8000;

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

export const api = {
  /** Fetch initial tasks (demo API) */
  async getTasks() {
    try {
      const data = await fetchWithTimeout(`${BASE_URL}/todos?_limit=8`);
      return data.map((t) => ({
        id: crypto.randomUUID(),
        title: t.title.charAt(0).toUpperCase() + t.title.slice(1),
        description: '',
        status: t.completed ? 'done' : 'todo',
        priority: 'medium',
        dueDate: '',
        createdAt: Date.now() - Math.floor(Math.random() * 1e7),
      }));
    } catch (err) {
      console.warn('API failed, using offline seed:', err.message);
      throw err;
    }
  },

  /** Simulate POST (real API would persist here) */
  async createTask(task) {
    await new Promise((r) => setTimeout(r, 200));
    return { ...task, id: crypto.randomUUID(), createdAt: Date.now() };
  },

  async updateTask(task) {
    await new Promise((r) => setTimeout(r, 150));
    return task;
  },

  async deleteTask(id) {
    await new Promise((r) => setTimeout(r, 150));
    return { id };
  },
};
