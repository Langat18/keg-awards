import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Button from './Button';

export default function Dialog({ open, title, onClose, children, footer, size = 'md' }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement;
    const onKey = e => e.key === 'Escape' && onClose?.();

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    const focusable = panelRef.current?.querySelector('input, textarea, select, button[data-autofocus]');
    focusable?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/40 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={e => e.stopPropagation()}
        className={`w-full rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-xl ${size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
      >
        <h2 id="dialog-title" className="text-lg font-bold">{title}</h2>
        <div className="mt-2 text-sm text-muted">{children}</div>
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback(options => new Promise(resolve => setState({ ...options, resolve })), []);

  function close(result) {
    state?.resolve(result);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={Boolean(state)}
        title={state?.title}
        onClose={() => close(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)}>Cancel</Button>
            <Button variant={state?.danger ? 'danger' : 'primary'} onClick={() => close(true)} data-autofocus>
              {state?.confirmLabel || 'Confirm'}
            </Button>
          </>
        }
      >
        {state?.message}
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
