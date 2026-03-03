import React from 'react';
import hapticFeedback from '../../utils/haptics';
import './Button.css';

const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', ...props }) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  
  return (
    <button 
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={(e) => {
        hapticFeedback.light();
        if (onClick) onClick(e);
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
