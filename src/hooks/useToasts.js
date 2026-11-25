import { useCallback, useState } from 'react';

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((text, tone) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  return { toasts, pushToast };
}
