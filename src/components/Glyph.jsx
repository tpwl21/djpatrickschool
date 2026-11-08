import React from 'react';

// Pictos maison "Felt-Pen Booth" : trait encre #333 arrondi, aplat crayon, ombre décalée nette.
// Remplacent les emojis partout dans l'UI. viewBox 24×24, `fill` écrase la couleur d'aplat.
const INK = '#333';

const GLYPHS = {
  // Phrases musicales
  intro: (f = '#ffbb44') => (
    <>
      <path d="M5.5 18a6.5 6.5 0 0 1 13 0Z" fill={f} />
      <path d="M12 7.6V4.6M4.6 10.4 3 9M19.4 10.4 21 9M2.5 18h19" fill="none" />
    </>
  ),
  build: (f = '#96ceb4') => (
    <>
      <path d="M2.5 19.5 9 8.5l3.6 5.6 2.9-3.6 6 9Z" fill={f} />
      <path d="m7.4 11.2 1.6-2.7 1.7 2.7" fill="#fff" />
    </>
  ),
  drop: (f = '#ff9f43') => (
    <>
      <path d="M12 2.8c.8 3.6 6 5.8 6 11a6 6 0 0 1-12 0c0-2.6 1.6-3.9 2.7-5.6.2 1.8 1 2.8 2.1 2.9-.4-3.2.2-5.7 1.2-8.3Z" fill={f} />
      <path d="M12 19.6a2.4 2.4 0 0 1-2.4-2.4c0-1.5 1.4-2.4 2.4-3.9 1 1.5 2.4 2.4 2.4 3.9a2.4 2.4 0 0 1-2.4 2.4Z" fill="#ffeead" />
    </>
  ),
  break: (f = '#74b9ff') => (
    <>
      <path d="M2.5 13c2.6-3.4 5.2-3.4 7.4 0s4.8 3.4 7.4 0c1.6-2 3-2.2 4.2-1.2v8.7h-19Z" fill={f} />
      <path d="M5 16.6c1.2-1 2.4-1 3.6 0" fill="none" />
    </>
  ),
  outro: (f = '#a29bfe') => (
    <path d="M14.6 3a8.6 8.6 0 1 0 6.6 13.6A7.2 7.2 0 0 1 14.6 3Z" fill={f} />
  ),

  // Wagons du train (instruments)
  kick: (f = '#fff') => (
    <>
      <circle cx="12" cy="12" r="8" fill={f} />
      <circle cx="12" cy="12" r="3" fill={INK} />
    </>
  ),
  clap: (f = '#fff') => (
    <>
      <rect x="4.4" y="8" width="6.4" height="13" rx="3.2" transform="rotate(14 7.6 21)" fill={f} />
      <rect x="13.2" y="8" width="6.4" height="13" rx="3.2" transform="rotate(-14 16.4 21)" fill={f} />
      <path d="M12 1.8v2.4M6.6 3l1.3 2M17.4 3l-1.3 2" fill="none" />
    </>
  ),
  hat: (f = '#fff') => (
    <path d="M12 2.5 14 10l7.5 2-7.5 2-2 7.5-2-7.5-7.5-2L10 10Z" fill={f} />
  ),
  note: (f = '#fff') => (
    <>
      <path d="M11.5 17V3.8c2.8.6 6 2.2 6 6" fill="none" />
      <ellipse cx="8" cy="17.2" rx="3.6" ry="3" fill={f} />
    </>
  ),

  // Retours & états
  bolt: (f = '#ffbb44') => (
    <path d="M13.6 2.5 4.5 13.8h6.6l-1.2 7.7 9.6-12h-6.8Z" fill={f} />
  ),
  lock: (f = '#ffeead') => (
    <>
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" />
      <rect x="4.5" y="11" width="15" height="10" rx="2.5" fill={f} />
      <circle cx="12" cy="15.6" r="1.4" fill={INK} stroke="none" />
    </>
  ),
  target: (f = '#ff6b6b') => (
    <>
      <circle cx="12" cy="12" r="9" fill="#fff" />
      <circle cx="12" cy="12" r="5.6" fill={f} />
      <circle cx="12" cy="12" r="2" fill="#fff" />
    </>
  ),
  burst: (f = '#ff6b6b') => (
    <path d="m12 2 2 5.2 5-2.4-1.9 5.3 5.3 1.9-5.3 1.9 1.9 5.3-5-2.4L12 22l-2-5.2-5 2.4 1.9-5.3L1.6 12l5.3-1.9L5 4.8l5 2.4Z" fill={f} />
  ),
  warning: (f = '#ffbb44') => (
    <>
      <path d="M12 3 22 20.5H2Z" fill={f} />
      <path d="M12 9.5v5" fill="none" />
      <circle cx="12" cy="17.4" r="1.2" fill={INK} stroke="none" />
    </>
  ),
  pencil: (f = '#ffbb44') => (
    <>
      <path d="m4 20 1.2-4.4L16 4.8l3.2 3.2L8.4 18.8Z" fill={f} />
      <path d="m4 20 1.2-4.4 3.2 3.2Z" fill="#fff" />
      <path d="m14 6.8 3.2 3.2" fill="none" />
    </>
  ),
  star: (f = '#ffbb44') => (
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z" fill={f} />
  ),
  vinyl: (f = '#ff6b6b') => (
    <>
      <circle cx="12" cy="12" r="9.5" fill={INK} />
      <circle cx="12" cy="12" r="6.6" fill="none" stroke="#666" strokeWidth="1" />
      <circle cx="12" cy="12" r="3.4" fill={f} stroke="none" />
      <circle cx="12" cy="12" r="0.9" fill="#fff" stroke="none" />
    </>
  ),
};



const Glyph = ({ name, size = '1.15em', fill, label, shadow = false, style = {} }) => {
  const draw = GLYPHS[name];
  if (!draw) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      stroke={INK}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      style={{
        display: 'inline-block',
        verticalAlign: '-0.2em',
        flexShrink: 0,
        overflow: 'visible',
        filter: shadow ? `drop-shadow(2px 2px 0 ${INK})` : undefined,
        ...style,
      }}
    >
      {draw(fill)}
    </svg>
  );
};

export default Glyph;
