import { useEffect, useState } from 'react';
import { DEFAULT_MAPPING_ID, getMapping, SMART_STORAGE_KEY } from '../constants/midiMappings';

const STORAGE_KEY = 'dj_teacher_midi_mapping';

export function useMidiMapping() {
  const [mappingId, setMappingIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_MAPPING_ID;
    } catch {
      return DEFAULT_MAPPING_ID;
    }
  });
  // Bump to force re-read of smart mapping when its storage changes.
  const [smartTick, setSmartTick] = useState(0);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) setMappingIdState(e.newValue);
      if (e.key === SMART_STORAGE_KEY) setSmartTick((t) => t + 1);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setMappingId = (id) => {
    setMappingIdState(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
  };

  // smartTick is in the dependency chain — re-derive mapping when smart storage changes.
  void smartTick;
  return { mappingId, setMappingId, mapping: getMapping(mappingId) };
}
