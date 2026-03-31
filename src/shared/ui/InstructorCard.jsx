import React from 'react';
import './InstructorCard.css';

const InstructorCard = ({ name, title, avatar_url, category, onClick, className = "" }) => {
  return (
    <div 
      className={`instructor-card ${className}`} 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
    >
      <div className="instructor-card-img-wrapper">
        <img 
          src={avatar_url || 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
          alt={name} 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
          }}
        />
      </div>
      <div className="instructor-card-info">
        <h3 className="instructor-card-name">{name}</h3>
        <p className="instructor-card-title">{title}</p>
        {category && <span className="instructor-card-tag">{category}</span>}
      </div>
    </div>
  );
};

export default InstructorCard;
