import React, { useState, useRef, useEffect } from 'react';
import './ModernDropdown.css';

const ModernDropdown = ({ options, value, onChange, label, multiple }) => {
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

  if (multiple) {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="modern-dropdown" ref={dropdownRef}>
        {label && <span className="dropdown-label">{label}</span>}
        <button 
          className={`dropdown-trigger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="current-value">
            {selected.length === 0
              ? 'Select instructors...'
              : selected.length === 1
                ? selected[0]
                : `${selected.length} instructors selected`}
          </span>
          <span className="material-symbols-outlined dropdown-icon">
            expand_more
          </span>
        </button>
        
        {isOpen && (
          <ul className="dropdown-menu">
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <li 
                  key={option} 
                  className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    const next = isSelected
                      ? selected.filter(v => v !== option)
                      : [...selected, option];
                    onChange(next);
                  }}
                >
                  <span className={`adm-custom-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <i className="ri-check-line"></i>}
                  </span>
                  {option}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

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
