import React from 'react';
import './TextLink.css';

/**
 * Standardized Text Link component to maintain design consistency
 * and prevent accidental styling regressions.
 */
const TextLink = ({ onClick, children, className = '', href, target }) => {
  if (href) {
    return (
      <a 
        href={href} 
        target={target} 
        className={`text-link ${className}`}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button 
      className={`text-link ${className}`} 
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};

export default TextLink;
