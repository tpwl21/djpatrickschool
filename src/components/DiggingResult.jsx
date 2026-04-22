import React from 'react';
import { motion } from 'framer-motion';

const DiggingResult = ({ correct, reason, title, discogsUrl, onRetry, onNext }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}
  >
    <div style={{
      background: '#fff', border: '4px solid #333', borderRadius: 12,
      padding: 30, maxWidth: 500, width: '90%', textAlign: 'center',
      boxShadow: '6px 6px 0px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>
        {correct ? '🎯' : '💥'}
      </div>
      <h2 style={{
        fontSize: '1.8rem', margin: '0 0 8px 0',
        color: correct ? '#27ae60' : '#e74c3c',
      }}>
        {correct ? 'Good pick!' : 'Not quite.'}
      </h2>
      {title && (
        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: 16 }}>
          You chose: <b>{title}</b>
        </div>
      )}
      <p style={{ fontSize: '1rem', lineHeight: 1.5, margin: '0 0 24px 0' }}>
        {reason}
      </p>
      {correct && discogsUrl && (
        <a
          href={discogsUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block', padding: '8px 16px',
            background: '#333', color: '#fff', fontWeight: 900,
            borderRadius: 6, textDecoration: 'none', fontSize: '0.8rem',
            marginBottom: 20, letterSpacing: 1,
          }}
        >
          OPEN ON DISCOGS ↗
        </a>
      )}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {!correct && (
          <button
            onClick={onRetry}
            className="btn-crayon nudge-btn"
            style={{ fontSize: '0.9rem' }}
          >
            Retry
          </button>
        )}
        {correct && (
          <button
            onClick={onNext}
            className="btn-crayon play-btn"
            style={{ fontSize: '0.9rem' }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

export default DiggingResult;
