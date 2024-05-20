import { useRef, useEffect } from 'react'

export const useSkipFirstRender = (fn: () => void, deps: any[]) => {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    fn()
  }, deps)
};
