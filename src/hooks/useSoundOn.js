import { useEffect, useState } from 'react';

const STORAGE_KEY = 'djPatrickSoundOn';

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === '1' || raw === 'true';
  } catch {
    return true;
  }
}

/**
 * Shared sound-on/off state, persisted in localStorage.
 * Default: true (ambient + sfx on).
 * Signature: [soundOn, setSoundOn]
 */
export function useSoundOn() {
  const [soundOn, setSoundOnState] = useState(readInitial);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setSoundOnState(e.newValue === '1' || e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setSoundOn = (value) => {
    const v = !!value;
    setSoundOnState(v);
    try { localStorage.setItem(STORAGE_KEY, v ? '1' : '0'); } catch { /* ignore */ }
  };

  return [soundOn, setSoundOn];
}
