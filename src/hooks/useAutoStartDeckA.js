import { useEffect } from 'react';

// Le deck A est le morceau de référence : il démarre tout seul dès que les pistes sont chargées,
// et le joueur ne travaille que sur le B (comme un DJ, on ne coupe pas le morceau qui tourne).
// Si le navigateur bloque le son (URL ouverte directement, Safari iOS), la première touche sur la page le lance.
export function useAutoStartDeckA(audioCtx, isReady, setIsPlayingA) {
  useEffect(() => {
    if (!isReady || !audioCtx?.ctx) return;
    let cancelled = false;
    const start = async () => {
      if (cancelled || audioCtx.decks.A.isPlaying) return;
      await audioCtx.playTrack('A');
      if (!cancelled) setIsPlayingA(true);
    };
    const ctx = audioCtx.ctx;
    if (ctx.state === 'running' || navigator.userActivation?.hasBeenActive) ctx.resume().then(start).catch(() => {});
    const onGesture = () => { ctx.resume().then(start).catch(() => {}); };
    window.addEventListener('pointerdown', onGesture, { once: true });
    return () => { cancelled = true; window.removeEventListener('pointerdown', onGesture); };
  }, [audioCtx, isReady, setIsPlayingA]);
}
