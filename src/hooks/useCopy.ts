import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyState = 'idle' | 'copied' | 'failed';

/** Copy text to the clipboard and expose a short-lived status for feedback. */
export function useCopy(resetAfter = 2000) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setState('copied');
      } catch {
        setState('failed');
      }
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState('idle'), resetAfter);
    },
    [resetAfter],
  );

  return { state, copy };
}
