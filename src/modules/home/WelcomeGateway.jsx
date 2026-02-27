import React from 'react';
import './WelcomeGateway.css';

const SECTIONS_DATA = [
  {
    id: 'learn',
    title: 'Learn',
    emoji: '📚',
    img: '/assets/learn-img.svg',
    summary: 'Explore essential courses to enhance your understanding of Governance concepts and processes.',
    hasStroke: false
  },
  {
    id: 'research',
    title: 'Research',
    emoji: '🔍',
    img: '/assets/research-img.svg',
    summary: 'Access a vast e-library with over 200 years of Governance intervention sources in Nigeria',
    hasStroke: true
  },
  {
    id: 'explore',
    title: 'Explore',
    emoji: '🚀',
    img: '/assets/explore-img.svg',
    summary: 'Use AI for research to enhance efficiency and tailor content to your needs.',
    hasStroke: false
  },
  {
    id: 'assess',
    title: 'Assess',
    emoji: '📊',
    img: '/assets/assess-img.svg',
    summary: 'Assess state Government performance to determine reform improvement areas.',
    hasStroke: true
  },
  {
    id: 'analyse',
    title: 'Analyse',
    emoji: '📉',
    img: '/assets/analyse-img.svg',
    summary: 'Centralized financial database to ensure availability of data for fiscal analysis.',
    hasStroke: false
  }
];

const WelcomeGateway = ({ onNavigate }) => {
  return (
    <div className="welcome-container">
      <div className="hero-section">
        <div className="pattern">
          <img src="/assets/hero-vector.svg" alt="hero background" />
        </div>

        <div className="title-container">
          <div className="section-container">
            <div className="hero-header">
              <div className="hero-chip">
                <div className="dot">
                  <img src="/assets/color-dots-[1.0].svg" alt="dot" />
                </div>
                <p className="chip-text">Your Governance intelligence Platform</p>
              </div>

              <h1 className="header-text">
                Everything you need for <br /> 
                <span className="green-text">Governance Excellence</span>
              </h1>
            </div>

            <p className="hero-summary">
              One unified platform for Learning, Research, AI Powered Insights and Governance Analytics
            </p>
          </div>
        </div>

        <div className="platform-card-wrapper">
          <div className="card-wrapper">
            {SECTIONS_DATA.map((section) => (
              <div 
                key={section.id} 
                className={`platform-card ${section.hasStroke ? 'has-stroke' : ''}`}
                onClick={() => onNavigate(section.id)}
              >
                <div className="card-title">
                  <div className="card-img">
                    <img src={section.img} alt={section.title} />
                  </div>
                  <p className="card-summary">{section.summary}</p>
                </div>

                <div className="card-link-wrapper">
                  <span className="card-link-text">{section.title}</span>
                  <span className="material-symbols-outlined arrow-icon">arrow_outward</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGateway;
