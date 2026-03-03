import React from 'react';
import hapticFeedback from '../../utils/haptics';
import './SpecialButton.css';

const SpecialButton = ({ onClick, children, className = '', type = 'button' }) => {
  return (
    <button 
      className={`special-button ${className}`} 
      onClick={(e) => {
        hapticFeedback.medium();
        if (onClick) onClick(e);
      }}
      type={type}
    >
      {children}
    </button>
  );
};

export default SpecialButton;
