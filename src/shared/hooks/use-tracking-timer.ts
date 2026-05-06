import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import { useEffect, useState } from 'react';

/**
 * Returns a live "HH:MM:SS" string counting up from the moment the GPS tracking started.
 * Returns null when tracking is not active.
 */
export function useTrackingTimer(): string | null {
  const trackingStartedAt = useSprayingStore((s) => s.trackingStartedAt);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!trackingStartedAt) {
      setElapsed(0);
      return;
    }

    const startMs = new Date(trackingStartedAt).getTime();

    // Tick immediately so the display is accurate from frame 0
    setElapsed(Math.floor((Date.now() - startMs) / 1000));

    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMs) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [trackingStartedAt]);

  if (!trackingStartedAt) return null;

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
