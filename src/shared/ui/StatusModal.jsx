import React, { useState } from 'react';
import Button from './Button';
import './StatusModal.css';

const StatusModal = ({ 
  isOpen, 
  title, 
  message, 
  description, // legacy support
  icon = 'ri-information-line', 
  iconColor = '#3b82f6', // blue-500
  iconBg = '#eff6ff',    // blue-50
  onConfirm, 
  onCancel,
  confirmLabel = 'Proceed',
  cancelLabel = 'Cancel'
}) => {
  if (!isOpen) return null;

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
              <p className="status-modal-desc">{message || description}</p>
            </div>
          </div>
        </div>

        <div className="status-modal-footer">
          <button className="btn-outline" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="special-button" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
