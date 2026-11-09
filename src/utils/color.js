// '#2b2b2b' (encre) sur fond clair, blanc sur fond foncé. Hex #rgb / #rrggbb ; autre format → encre.
export const inkOn = (bg) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(bg || '');
  if (!m) return '#2b2b2b';
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const [r, g, b] = [0, 2, 4].map((k) => {
    const c = parseInt(h.slice(k, k + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (L + 0.05) / 0.0668 >= 1.05 / (L + 0.05) ? '#2b2b2b' : '#ffffff';
};

// Paliers dans la couleur de l'atelier (la charte reste celle de l'atelier) :
// EASY = teinte claire, MEDIUM = couleur pleine, PRO = ombre foncée.
export const tierColor = (color, tier) =>
  tier === 'EASY' ? `color-mix(in srgb, ${color} 50%, #fff)`
    : tier === 'PRO' ? `color-mix(in srgb, ${color} 60%, #000)`
      : color;
export const tierInk = (color, tier) => (tier === 'EASY' ? '#2b2b2b' : tier === 'PRO' ? '#ffffff' : inkOn(color));
