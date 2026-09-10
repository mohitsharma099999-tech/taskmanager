export const validateTask = ({ title, dueDate }) => {
  const errors = {};

  const t = (title || '').trim();
  if (!t) errors.title = 'Title is required.';
  else if (t.length < 3) errors.title = 'Title must be at least 3 characters.';
  else if (t.length > 80) errors.title = 'Title must be under 80 characters.';

  if (dueDate) {
    const d = new Date(dueDate + 'T00:00:00');
    if (isNaN(d)) errors.dueDate = 'Invalid date.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const showFieldErrors = (errors) => {
  document.getElementById('titleError').textContent = errors.title || '';
};