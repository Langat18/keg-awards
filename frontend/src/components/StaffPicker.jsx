import { useState, useRef, useEffect } from 'react';


export default function StaffPicker({
  users = [],
  value,
  onChange,
  error,
  placeholder = 'Search staff…',
  disabled = false,
}) {
  const [query, setQuery]       = useState('');
  const [open, setOpen]         = useState(false);
  const containerRef            = useRef(null);

  const selected = users.find(u => String(u.id) === String(value));

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = users.filter(u => {
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q)
    );
  });

  function select(u) {
    onChange(String(u.id));
    setOpen(false);
    setQuery('');
  }

  function clear(e) {
    e.stopPropagation();
    onChange('');
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        className={`w-full flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors bg-white
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400'}
          ${error    ? 'border-red-400' : open ? 'border-[#7F622C] ring-2 ring-[#7F622C]/20' : 'border-gray-300'}
        `}
      >
        {selected ? (
          <>
            <div className="w-6 h-6 rounded-full bg-[#7F622C]/10 text-[#7F622C] text-[10px] font-bold flex items-center justify-center shrink-0">
              {selected.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <span className="flex-1 font-medium text-gray-800 truncate">{selected.name}</span>
            {selected.department && (
              <span className="text-xs text-gray-400 shrink-0">{selected.department}</span>
            )}
            <button
              type="button"
              onClick={clear}
              className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <span className="text-gray-400 flex-1">{placeholder}</span>
            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </>
        )}
      </div>


      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type name or department…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7F622C] focus:ring-1 focus:ring-[#7F622C]/20"
              />
            </div>
          </div>


          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">No staff match your search.</li>
            ) : (
              filtered.map(u => (
                <li
                  key={u.id}
                  onMouseDown={() => select(u)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-[#CBD300]/10
                    ${String(u.id) === String(value) ? 'bg-[#7F622C]/5' : ''}
                  `}
                >
                  <div className="w-7 h-7 rounded-full bg-[#7F622C]/10 text-[#7F622C] text-[10px] font-bold flex items-center justify-center shrink-0">
                    {u.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                    {u.department && (
                      <p className="text-xs text-gray-400 truncate">{u.department}</p>
                    )}
                  </div>
                  {String(u.id) === String(value) && (
                    <svg className="w-4 h-4 text-[#7F622C] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>

          <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400">
              {filtered.length} of {users.length} staff
            </p>
          </div>
        </div>
      )}
    </div>
  );
}