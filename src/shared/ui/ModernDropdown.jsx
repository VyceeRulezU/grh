import React, { useState, useRef, useEffect } from 'react';
import './ModernDropdown.css';

const ModernDropdown = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="modern-dropdown" ref={dropdownRef}>
      {label && <span className="dropdown-label">{label}</span>}
      <button 
        className={`dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="current-value">{value}</span>
        <span className="material-symbols-outlined dropdown-icon">
          expand_more
        </span>
      </button>
      
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option) => (
            <li 
              key={option} 
              className={`dropdown-item ${option === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
              {option === value && (
                <span className="material-symbols-outlined check-icon">check</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModernDropdown;
