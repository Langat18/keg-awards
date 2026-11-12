import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Avatar from './Avatar';
import Icon from './Icon';

export default function StaffPicker({ users = [], value, onChange, error, placeholder = 'Search by name or department' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  const selected = users.find(u => String(u.id) === String(value));

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.name.toLowerCase().includes(q) || (u.department || '').toLowerCase().includes(q));
  }, [users, query]);

  useEffect(() => {
    function onDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => setHighlight(0), [query]);

  function choose(user) {
    onChange(String(user.id));
    setQuery('');
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight(h => Math.min(h + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && open && matches[highlight]) {
      e.preventDefault();
      choose(matches[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  if (selected && !open) {
    return (
      <div className={`flex items-center gap-3 rounded border bg-white px-3 py-2 ${error ? 'border-red-500' : 'border-line'}`}>
        <Avatar name={selected.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{selected.name}</p>
          {selected.department && <p className="truncate text-xs text-muted">{selected.department}</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            onChange('');
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="text-sm font-semibold text-brand hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={error ? 'true' : undefined}
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="field pl-9"
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-white py-1 shadow-lg shadow-brand-ink/10"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">No one matches “{query}”.</li>
          ) : (
            matches.map((u, i) => (
              <li
                key={u.id}
                role="option"
                aria-selected={i === highlight}
                onMouseDown={e => {
                  e.preventDefault();
                  choose(u);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${i === highlight ? 'bg-brand-tint' : ''}`}
              >
                <Avatar name={u.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  {u.department && <p className="truncate text-xs text-muted">{u.department}</p>}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
