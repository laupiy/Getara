import { useCallback, useEffect, useState } from 'react';

// Router sederhana berbasis URL hash (#/overview). Tanpa dependency tambahan.
export function useHashRoute(validIds, defaultId) {
  const read = useCallback(() => {
    const id = window.location.hash.replace(/^#\/?/, '');
    return validIds.includes(id) ? id : defaultId;
  }, [validIds, defaultId]);

  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [read]);

  const navigate = useCallback((id) => {
    window.location.hash = `/${id}`;
  }, []);

  return [route, navigate];
}
