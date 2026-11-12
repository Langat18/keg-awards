export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || '?';
}

export function firstName(name = '') {
  return name.split(/\s+/)[0] || '';
}

export function plural(count, word, many = `${word}s`) {
  return `${count} ${count === 1 ? word : many}`;
}

export function criteriaList(text) {
  return (text || '')
    .split('\n')
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

export function errorMessage(err, fallback = 'Something went wrong. Try again.') {
  const data = err?.response?.data;

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ');
  }

  if (!err?.response) {
    return 'Cannot reach the server. Check your connection and try again.';
  }

  if (err.response.status === 429) {
    return 'Too many attempts. Wait a minute and try again.';
  }

  return data?.message || fallback;
}

export function fieldErrors(err) {
  const errors = err?.response?.data?.errors || {};

  return Object.fromEntries(Object.entries(errors).map(([key, list]) => [key, list[0]]));
}

export function formatDate(value) {
  if (!value) return null;

  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}
