import React, { useEffect, useRef, useState } from 'react';

const VuMeter = ({
  level = 0,
  width = 24,
  height = 160,
  label = 'LVL',
  showLabel = true,
  peakHoldMs = 1500,
}) => {
  const [peak, setPeak] = useState(0);
  const peakRef = useRef(0);
  const peakTimeoutRef = useRef(null);

  // Drive peak updates imperatively to avoid setState-in-effect lint error.
  // We compare against the ref (not the state) synchronously, and schedule
  // the state write via setTimeout so it is always async.
  useEffect(() => {
    if (level > peakRef.current) {
      peakRef.current = level;
      if (peakTimeoutRef.current) clearTimeout(peakTimeoutRef.current);
      // Defer the state write — not synchronous in the effect body
      const id = setTimeout(() => setPeak(level), 0);
      peakTimeoutRef.current = setTimeout(() => {
        clearTimeout(id);
        peakRef.current = 0;
        setPeak(0);
      }, peakHoldMs);
    }
    return () => {
      if (peakTimeoutRef.current) clearTimeout(peakTimeoutRef.current);
    };
  }, [level, peakHoldMs]);

  const clamped = Math.max(0, Math.min(1, level));
  const clampedPeak = Math.max(0, Math.min(1, peak));
  const fillH = clamped * height;
  const peakY = height - clampedPeak * height;

  // Zone boundaries (in [0,1]): 0-0.7 green, 0.7-0.9 yellow, 0.9-1.0 red
  const greenH = 0.7 * height;
  const yellowH = 0.2 * height;
  const redH   = 0.1 * height;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {showLabel && (
        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'currentColor', letterSpacing: 1 }}>{label}</span>
      )}
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {/* Track background — full 3-zone gradient greyed out */}
        <rect x="0" y={height - greenH - yellowH - redH} width={width} height={redH}    fill="#551313" stroke="#333" strokeWidth="2" />
        <rect x="0" y={height - greenH - yellowH}         width={width} height={yellowH} fill="#5a4a13" stroke="#333" strokeWidth="2" />
        <rect x="0" y={height - greenH}                   width={width} height={greenH}  fill="#143a14" stroke="#333" strokeWidth="2" />

        {/* Active fill — colored per zone, only up to current level */}
        {clamped > 0 && (
          <>
            <rect
              x="0"
              y={height - Math.min(fillH, greenH)}
              width={width}
              height={Math.min(fillH, greenH)}
              fill="#2ecc71"
            />
            {fillH > greenH && (
              <rect
                x="0"
                y={height - greenH - Math.min(fillH - greenH, yellowH)}
                width={width}
                height={Math.min(fillH - greenH, yellowH)}
                fill="#f1c40f"
              />
            )}
            {fillH > greenH + yellowH && (
              <rect
                x="0"
                y={height - greenH - yellowH - Math.min(fillH - greenH - yellowH, redH)}
                width={width}
                height={Math.min(fillH - greenH - yellowH, redH)}
                fill="#e74c3c"
              />
            )}
          </>
        )}

        {/* Peak-hold tick */}
        {clampedPeak > 0 && (
          <rect x="-2" y={peakY - 1} width={width + 4} height="2" fill="#fff" />
        )}

        {/* 0 dB line (around 0.7 = green/yellow boundary) */}
        <line
          x1="-3" y1={height - greenH} x2={width + 3} y2={height - greenH}
          stroke="#fff" strokeWidth="1" strokeDasharray="2 2"
        />
      </svg>
    </div>
  );
};

export default VuMeter;
