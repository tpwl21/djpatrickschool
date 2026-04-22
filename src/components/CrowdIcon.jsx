import React from 'react';

const CrowdIcon = ({ color = '#D4A017', style = {} }) => (
  <div style={{ position: 'relative', width: '56px', height: '42px', flexShrink: 0, ...style }}>
    <svg width="56" height="42" viewBox="0 0 56 42">
      {/* Stage base */}
      <rect x="2" y="34" width="52" height="6" fill={color} stroke="#333" strokeWidth="2.5" rx="2" />
      {/* Silhouette 1 (small, back) */}
      <g transform="translate(8 14)">
        <circle cx="4" cy="4" r="3.5" fill="#333" />
        <rect x="2" y="7" width="4" height="11" fill="#333" rx="1" />
        <line x1="2" y1="9"  x2="-1" y2="15" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="9"  x2="9"  y2="15" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="18" x2="2"  y2="25" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <line x1="5" y1="18" x2="6"  y2="25" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Silhouette 2 (tall, arms up, center) */}
      <g transform="translate(23 6)">
        <circle cx="5" cy="5" r="4" fill="#333" />
        <rect x="3" y="9" width="4" height="13" fill="#333" rx="1" />
        <line x1="3" y1="12" x2="-1" y2="2"  stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="7" y1="12" x2="11" y2="2"  stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="4" y1="22" x2="3"  y2="30" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="6" y1="22" x2="7"  y2="30" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Silhouette 3 (smaller, right) */}
      <g transform="translate(40 14)">
        <circle cx="4" cy="4" r="3.5" fill="#333" />
        <rect x="2" y="7" width="4" height="11" fill="#333" rx="1" />
        <line x1="2" y1="9"  x2="-2" y2="5" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="9"  x2="10" y2="5" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="18" x2="2"  y2="25" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <line x1="5" y1="18" x2="6"  y2="25" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

export default CrowdIcon;
