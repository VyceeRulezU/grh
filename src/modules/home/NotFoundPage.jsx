import React from 'react';
import SpecialButton from '../../shared/ui/SpecialButton';
import './NotFoundPage.css';

const NotFoundPage = ({ 
  onNavigate,
  title = null,
  summary = null,
  errorCode = '404'
}) => {
  return (
    <div className="notfound-container">
      {/* Background decoration matching welcome page */}
      <div className="notfound-bg-pattern">
        <img src={`${import.meta.env.BASE_URL}assets/hero-vector.svg`} alt="" aria-hidden="true" />
      </div>

      <div className="notfound-content">
        {/* Chip — same as hero-chip on welcome page */}
        <div className="hero-chip notfound-chip">
          <div className="dot">
            <img src={`${import.meta.env.BASE_URL}assets/color-dots-[1.0].svg`} alt="" />
          </div>
          <p className="chip-text">{errorCode === '404' ? 'Page Not Found' : 'Something Went Wrong'}</p>
        </div>

        {/* Large error code */}
        <div className="notfound-code" aria-label={errorCode}>
          {errorCode.split('').map((char, i) => (
            <span key={i} className={char === '0' ? 'notfound-zero' : ''}>{char}</span>
          ))}
        </div>

        <h1 className="notfound-title">
          {title || (<>This page doesn't <br /> <span className="green-text">exist yet</span></>)}
        </h1>

        <p className="notfound-summary">
          {summary || 'The page you\'re looking for may have been moved, renamed, or is not available. Let\'s get you back to the Hub.'}
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
