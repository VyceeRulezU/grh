import React from 'react';
import './SpecialButton.css';

const SpecialButton = ({ onClick, children, className = '', type = 'button' }) => {
  return (
    <button 
      className={`special-button ${className}`} 
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default SpecialButton;
