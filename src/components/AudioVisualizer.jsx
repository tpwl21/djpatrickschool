import React, { useRef, useEffect } from 'react';

const AudioVisualizer = ({ audioCtx, color = '#ff6b6b' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!audioCtx || !audioCtx.analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = audioCtx.analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioCtx, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={80} 
      style={{ 
        width: '100%', 
        height: '100%', 
        opacity: 0.8,
        pointerEvents: 'none'
      }} 
    />
  );
};

export default AudioVisualizer;
