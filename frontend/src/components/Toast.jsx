import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from './Icon';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: 'check', className: 'border-emerald-200 bg-white text-emerald-900', iconClass: 'text-emerald-600' },
  error: { icon: 'alert', className: 'border-red-200 bg-white text-red-900', iconClass: 'text-red-600' },
  info: { icon: 'info', className: 'border-line bg-white text-brand-ink', iconClass: 'text-brand' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback(id => setToasts(list => list.filter(t => t.id !== id)), []);

  const push = useCallback((message, type) => {
    const id = ++nextId.current;
    setToasts(list => [...list.slice(-3), { id, message, type }]);
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: message => push(message, 'success'),
    error: message => push(message, 'error'),
    info: message => push(message, 'info'),
  }), [push]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
      >
        {toasts.map(t => {
          const style = STYLES[t.type];
          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg shadow-brand-ink/10 ${style.className}`}
            >
              <Icon name={style.icon} className={`mt-0.5 h-[18px] w-[18px] ${style.iconClass}`} />
              <p className="flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-muted hover:text-brand-ink" aria-label="Dismiss">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
