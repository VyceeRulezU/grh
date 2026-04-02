import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Helmet } from 'react-helmet-async';
import './WelcomeGateway.css';

const SECTIONS_DATA = [
  {
    id: 'learn',
    title: 'Learn',
    emoji: '📚',
    img: 'assets/learn-img.svg',
    summary: 'Explore essential courses to enhance your understanding of Governance concepts and processes.',
    hasStroke: false
  },
  {
    id: 'research',
    title: 'Research',
    emoji: '🔍',
    img: 'assets/research-img.svg',
    summary: 'Access a vast e-library with over 200 years of Governance intervention sources in Nigeria',
    hasStroke: true
  },
  {
    id: 'explore',
    title: 'Explore',
    emoji: '🚀',
    img: 'assets/explore-img.svg',
    summary: 'Use AI for research to enhance efficiency and tailor content to your needs.',
    hasStroke: false
  },
  {
    id: 'assess',
    title: 'Assess',
    emoji: '📊',
    img: 'assets/assess-img.svg',
    summary: 'Assess state Government performance to determine reform improvement areas.',
    hasStroke: true
  },
  {
    id: 'analyse',
    title: 'Analyse',
    emoji: '📉',
    img: 'assets/analyse-img.svg',
    summary: 'Centralized financial database to ensure availability of data for fiscal analysis.',
    hasStroke: false
  }
];

const WelcomeGateway = ({ onNavigate }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.to('.hero-chip', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0
      });

      gsap.to('.header-text', {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.2,
        ease: 'power4.out'
      });

      gsap.to('.welcome-hero-summary', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out'
      });

      // Cards stagger
      gsap.to('.platform-card', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        delay: 0.6,
        ease: 'back.out(1.7)'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="welcome-container" ref={containerRef}>
      <Helmet>
        <title>Governance Resource Hub | Excellence Redefined</title>
        <meta name="description" content="Explore everything you need for Governance Excellence. A unified platform for Learning, Research, AI Powered Insights and Governance Analytics." />
      </Helmet>
      <div className="welcome-hero-section">
        <div className="pattern">
          <img src={`${import.meta.env.BASE_URL}assets/hero-vector.svg`} alt="hero background" loading="lazy" />
        </div>

        <div className="title-container">
          <div className="section-container">
            <div className="hero-header">
              <div className="hero-chip">
                <div className="dot">
                  <img src={`${import.meta.env.BASE_URL}assets/color-dots-[1.0].svg`} alt="dot" />
                </div>
                <p className="chip-text">Your Governance intelligence Platform</p>
              </div>

              <h1 className="header-text">
                Everything you need for <br /> 
                <span className="green-text">Governance Excellence</span>
              </h1>
            </div>

            <div className="lp-hero-summary">
              <p className="lp-hero-summary-text">
                One unified platform for Learning, Research, AI Powered Insights and Governance Analytics
              </p>

              <button className="special-button" onClick={() => onNavigate('about')}>
                About the Resource Hub
              </button>
            </div>
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
                    <img src={`${import.meta.env.BASE_URL}${section.img}`} alt={section.title} loading="lazy" />
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
      
      <div className="welcome-legal-row">

        <div className="legal-container">

          <p className="copyright-text">© {new Date().getFullYear()} Governance Resource Hub. All rights reserved.</p>

          <div className="legal-links">
            <button onClick={() => onNavigate('privacy-policy')}>Privacy Policy</button>
            <span className="separator">•</span>
            <button onClick={() => onNavigate('terms-of-service')}>Terms of Service</button>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default WelcomeGateway;
