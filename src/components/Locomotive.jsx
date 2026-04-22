import React from 'react';

const Locomotive = ({ color = '#ff6b6b', style = {} }) => {
  return (
    <div style={{
      position: 'relative',
      width: '60px',
      height: '35px',
      backgroundColor: color,
      border: '3px solid #333',
      borderRadius: '4px 12px 4px 4px',
      boxShadow: '3px 3px 0px #333',
      flexShrink: 0,
      ...style
    }}>
      {/* Cabin */}
      <div style={{
        position: 'absolute',
        right: '-3px',
        top: '-12px',
        width: '24px',
        height: '22px',
        backgroundColor: color,
        border: '3px solid #333',
        borderBottom: 'none',
        borderRadius: '4px 4px 0 0'
      }} />
      
      {/* Chimney */}
      <div style={{
        position: 'absolute',
        left: '10px',
        top: '-12px',
        width: '10px',
        height: '14px',
        backgroundColor: '#333',
        borderRadius: '2px'
      }} />

      {/* Wheels */}
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '15%',
        width: '12px',
        height: '12px',
        backgroundColor: '#333',
        borderRadius: '50%',
        border: '2px solid #fff'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '45%',
        width: '12px',
        height: '12px',
        backgroundColor: '#333',
        borderRadius: '50%',
        border: '2px solid #fff'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '75%',
        width: '12px',
        height: '12px',
        backgroundColor: '#333',
        borderRadius: '50%',
        border: '2px solid #fff'
      }} />
    </div>
  );
};

export default Locomotive;
