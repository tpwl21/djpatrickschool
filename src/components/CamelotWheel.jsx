import React, { useState } from 'react';
import { compatibleSet } from '../lib/camelot.js';

const OUTER_R = 120;
const INNER_R = 78;
const CENTER = 140;

function polar(r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

const CELLS = [];
for (let n = 1; n <= 12; n++) {
  const angle = (n - 1) * 30;
  CELLS.push({ key: `${n}B`, ring: 'outer', angle, label: `${n}B` });
  CELLS.push({ key: `${n}A`, ring: 'inner', angle, label: `${n}A` });
}

const CamelotWheel = ({
  keyA,
  keyB,
  size = 280,
  draggable = false,
  onDropAt,
  color = '#8E44AD',
}) => {
  const [hoverKey, setHoverKey] = useState(null);
  const compat = keyA ? compatibleSet(keyA) : [];
  const _scale = size / (CENTER * 2);

  const handleClick = (k) => {
    if (draggable && onDropAt) onDropAt(k);
  };

  return (
    <svg
      width={size} height={size} viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}
      style={{ userSelect: 'none', touchAction: 'none' }}
    >
      <circle cx={CENTER} cy={CENTER} r={OUTER_R + 6} fill="none" stroke="#333" strokeWidth="3" />
      <circle cx={CENTER} cy={CENTER} r={INNER_R - 6} fill="none" stroke="#333" strokeWidth="3" />

      {CELLS.map((c) => {
        const r = c.ring === 'outer' ? (OUTER_R - 12) : (INNER_R - 12);
        const p = polar(r, c.angle);
        const isA = c.key === keyA;
        const isB = c.key === keyB;
        const isCompat = compat.includes(c.key) && !isA;
        let fill = '#fff';
        if (isA) fill = color;
        else if (isB) fill = '#f1c40f';
        else if (isCompat) fill = '#e8d1f5';
        if (hoverKey === c.key && draggable) fill = color;

        return (
          <g
            key={c.key}
            onClick={() => handleClick(c.key)}
            onMouseEnter={() => draggable && setHoverKey(c.key)}
            onMouseLeave={() => draggable && setHoverKey((h) => (h === c.key ? null : h))}
            style={{ cursor: draggable ? 'pointer' : 'default' }}
          >
            <circle
              cx={p.x} cy={p.y} r={22}
              fill={fill} stroke="#333" strokeWidth="2.5"
            />
            <text
              x={p.x} y={p.y + 5} textAnchor="middle"
              fontSize="13" fontWeight="900"
              fill={isA || (hoverKey === c.key && draggable) ? '#fff' : '#333'}
            >
              {c.label}
            </text>
          </g>
        );
      })}

      {/* Marker legend */}
      <text x={CENTER} y={24} textAnchor="middle" fontSize="11" fontWeight="700" fill="#333">
        Camelot Wheel
      </text>
    </svg>
  );
};

export default CamelotWheel;
