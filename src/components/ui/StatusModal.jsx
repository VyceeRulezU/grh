import React, { useState } from 'react';
import Button from './Button';
import './StatusModal.css';

const StatusModal = ({ 
  isOpen, 
  title, 
  description, 
  icon = 'ri-information-line', 
  iconColor = '#3b82f6', // blue-500
  iconBg = '#eff6ff',    // blue-50
  onConfirm, 
  confirmLabel = 'Continue',
  showCheckbox = true,
  checkboxLabel = "Don't show it again",
  onCheckboxChange
}) => {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  const handleCheckbox = () => {
    const newState = !checked;
    setChecked(newState);
    if (onCheckboxChange) onCheckboxChange(newState);
  };

  return (
    <div className="status-modal-overlay">
      <div className="status-modal-container animate-up">
        <div className="status-modal-content">
          <div className="status-modal-header">
            <div 
              className="status-modal-icon-wrap" 
              style={{ backgroundColor: iconBg, color: iconColor }}
            >
              <i className={icon}></i>
            </div>
            <div className="status-modal-text">
              <h3 className="status-modal-title">{title}</h3>
              <p className="status-modal-desc">{description}</p>
            </div>
          </div>
        </div>

        <div className="status-modal-footer">
          {showCheckbox && (
            <div className="status-modal-checkbox-wrap" onClick={handleCheckbox}>
              <div className={`status-modal-checkbox ${checked ? 'checked' : ''}`}>
                {checked && <i className="ri-check-line"></i>}
              </div>
              <span className="status-modal-checkbox-label">{checkboxLabel}</span>
            </div>
          )}
          <Button 
             className="status-modal-btn" 
             onClick={onConfirm}
             style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-full)', padding: '10px 30px' }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
