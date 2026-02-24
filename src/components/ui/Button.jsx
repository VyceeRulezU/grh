import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', ...props }) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  
  return (
    <button 
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
