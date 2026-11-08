import { useEffect, useRef, useState } from 'react';
import { MagicAudioContext } from '../audio/MagicAudioContext';

/**
 * Boots a MagicAudioContext, loads tracks A and B, and tears down on unmount.
 * Post-load setup (initial pitch, cue position) belongs in a separate effect
 * watching `audioCtx` in the consumer.
 */
export const useAudioDeck = (configA, configB, trackLengthSec) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isReady, setIsReady] = useState(false);
  // échec réel de chargement (réseau, fichier) : affiché au joueur au lieu d'un « Chargement… » infini
  const [loadError, setLoadError] = useState(false);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (!configA || !configB) return undefined;

    const ctx = new MagicAudioContext();
    audioCtxRef.current = ctx;
    let cancelled = false;

    (async () => {
      try {
        await ctx.init();
        await Promise.all([
          ctx.loadTrack('A', configA.url, configA.bpm, trackLengthSec, configA.complexity),
          ctx.loadTrack('B', configB.url, configB.bpm, trackLengthSec, configB.complexity),
        ]);
        setAudioCtx(ctx);
        setIsReady(true);
      } catch (e) {
        // un démontage en cours de chargement n'est pas une erreur pour le joueur
        if (!cancelled) {
          console.error('Audio init failed', e);
          setLoadError(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (ctx && ctx.ctx) ctx.ctx.close().catch(() => {});
    };
  }, [configA, configB, trackLengthSec]);

  return { audioCtx, audioCtxRef, isReady, loadError };
};
