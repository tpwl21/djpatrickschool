import { useRef } from 'react';

/**
 * Bouton de nudge : maintenir enfoncé = pitch bend temporaire ±bendFactor,
 * relâcher = retour au pitch de base.
 *
 * Props:
 *   audioCtxRef    — ref vers MagicAudioContext
 *   deckId         — 'A' | 'B'
 *   dir            — -1 (ralentir) | 1 (accélérer)
 *   onPitchChange  — callback(rate) pour synchroniser l'état UI parent
 *   label          — texte du bouton
 *   active         — booléen (highlight MIDI externe)
 *   bendFactor     — intensité du bend (défaut 0.04 = 4%)
 *   className, style — passés au <button>
 */
export default function NudgeButton({
  audioCtxRef,
  deckId,
  dir,
  onPitchChange,
  label,
  active = false,
  bendFactor = 0.04,
  className = '',
  style = {},
}) {
  const baseRateRef = useRef(null);

  const start = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || baseRateRef.current !== null) return;
    baseRateRef.current = ctx.decks[deckId].rate;
    const bendRate = baseRateRef.current * (1 + dir * bendFactor);
    ctx.setPlaybackRate(deckId, bendRate);
    onPitchChange(bendRate);
  };

  const stop = () => {
    if (baseRateRef.current === null) return;
    const rate = baseRateRef.current;
    baseRateRef.current = null;
    audioCtxRef.current?.setPlaybackRate(deckId, rate);
    onPitchChange(rate);
  };

  return (
    <button
      className={`btn-crayon nudge-btn${active ? ' active' : ''} ${className}`.trim()}
      style={active ? { background: '#ff6b6b', color: '#2b2b2b', ...style } : style}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
    >
      {label}
    </button>
  );
}
