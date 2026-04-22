import React from 'react';

const BookIcon = ({ color = '#4CAF50', style = {} }) => {
  return (
    <div style={{ position: 'relative', width: '44px', height: '36px', flexShrink: 0, ...style }}>
      {/* Spine */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '10px',
        height: '100%',
        backgroundColor: color,
        border: '3px solid #333',
        borderRight: 'none',
        borderRadius: '4px 0 0 4px',
        boxShadow: '3px 3px 0px #333',
      }} />
      {/* Pages block */}
      <div style={{
        position: 'absolute',
        left: '10px',
        top: 0,
        right: 0,
        height: '100%',
        backgroundColor: '#fff',
        border: '3px solid #333',
        borderRadius: '0 4px 4px 0',
      }}>
        {[7, 13, 19].map((top) => (
          <div key={top} style={{
            position: 'absolute',
            top,
            left: '5px',
            right: '5px',
            height: '2px',
            backgroundColor: '#ddd',
            borderRadius: '1px',
          }} />
        ))}
      </div>
    </div>
  );
};

export default BookIcon;
