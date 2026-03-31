import React from 'react';
import './InstructorDetailModal.css';

const InstructorDetailModal = ({ isOpen, onClose, instructor }) => {
  if (!isOpen || !instructor) return null;

  return (
    <div className="instructor-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="instructor-modal-content animate-up" onClick={(e) => e.stopPropagation()}>
        <button className="instructor-modal-close" onClick={onClose} aria-label="Close modal">
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="instructor-modal-header">
          <div className="instructor-modal-img">
             <img src={instructor.avatar_url || 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} alt={instructor.name} />
          </div>
          <div className="instructor-modal-intro">
            <span className="instructor-modal-tag">{instructor.category || 'Expert'}</span>
            <h2>{instructor.name}</h2>
            <p className="instructor-modal-title">{instructor.title}</p>
          </div>
        </div>

        <div className="instructor-modal-body">
          <h3>Expert Summary</h3>
          <p className="instructor-modal-summary">
            {instructor.summary || "No summary available for this instructor."}
          </p>
        </div>

        <div className="instructor-modal-footer">
          <button className="special-button" onClick={onClose}>Close Profile</button>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailModal;
