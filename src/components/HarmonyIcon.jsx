import React from 'react';

const HarmonyIcon = ({ color = '#8E44AD', style = {} }) => (
  <div style={{ position: 'relative', width: '58px', height: '42px', flexShrink: 0, ...style }}>
    <svg width="58" height="42" viewBox="0 0 58 42">
      {/* 5 staff lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="2"
          y1={11 + i * 5}
          x2="56"
          y2={11 + i * 5}
          stroke="#333"
          strokeWidth="1.5"
        />
      ))}

      {/* Stylized treble clef in workshop color */}
      <g transform="translate(4 8)">
        <path
          d="M 6 2 C 3 2, 2 5, 2 8 C 2 12, 5 14, 7 14 C 10 14, 11 12, 11 10 C 11 7, 8 6, 7 8 C 6 10, 8 11, 9 10 M 7 14 L 6 24 C 6 28, 9 30, 11 28 C 13 26, 12 22, 8 22 C 5 22, 4 25, 5 27"
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* First note — filled head on staff, stem up */}
      <g>
        <ellipse cx="29" cy="26" rx="4" ry="3" fill="#333" transform="rotate(-20 29 26)" />
        <line x1="32.5" y1="25" x2="32.5" y2="8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Second note — colored head, higher on staff */}
      <g>
        <ellipse cx="45" cy="21" rx="4" ry="3" fill={color} transform="rotate(-20 45 21)" />
        <line x1="48.5" y1="20" x2="48.5" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Beam connecting the two stems */}
      <line x1="32.5" y1="8" x2="48.5" y2="8" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </div>
);

export default HarmonyIcon;
