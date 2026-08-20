import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && <ToastView toast={toast} onDone={() => setToast(null)} />}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onDone }) {
  const color = toast.type === 'info' ? 'var(--primary)' : toast.type === 'error' ? 'var(--accent)' : 'var(--neon-green)';
  setTimeout(onDone, 3000);
  return <div className="toast show" style={{ borderLeftColor: color }}>{toast.message}</div>;
}

export function useToast() {
  return useContext(ToastContext);
}
