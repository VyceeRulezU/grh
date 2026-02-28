import React from 'react';
import SpecialButton from '../../components/ui/SpecialButton';
import './NotFoundPage.css';

const NotFoundPage = ({ onNavigate }) => {
  return (
    <div className="notfound-container">
      {/* Background decoration matching welcome page */}
      <div className="notfound-bg-pattern">
        <img src="assets/hero-vector.svg" alt="" aria-hidden="true" />
      </div>

      <div className="notfound-content">
        {/* Chip — same as hero-chip on welcome page */}
        <div className="hero-chip notfound-chip">
          <div className="dot">
            <img src="assets/color-dots-[1.0].svg" alt="" />
          </div>
          <p className="chip-text">Page Not Found</p>
        </div>

        {/* Large 404 */}
        <div className="notfound-code" aria-label="404">
          <span>4</span>
          <span className="notfound-zero">0</span>
          <span>4</span>
        </div>

        <h1 className="notfound-title">
          This page doesn't <br />
          <span className="green-text">exist yet</span>
        </h1>

        <p className="notfound-summary">
          The page you're looking for may have been moved, renamed,
          or is not available. Let's get you back to the Hub.
        </p>

        <SpecialButton onClick={() => onNavigate('welcome')}>
          Back to Website
          <span className="material-symbols-outlined">arrow_outward</span>
        </SpecialButton>
      </div>
    </div>
  );
};

export default NotFoundPage;
