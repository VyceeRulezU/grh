import React from 'react';
import Button from '../../components/ui/Button';
import './WelcomeGateway.css';

import LogoV2 from '../../assets/images/Logo/GRH-v2.png';

const SECTIONS_DATA = [
  { id: "learn", title: "Learn", tagline: "E-Learning Platform", description: "Access comprehensive governance courses, interactive lessons, quizzes, and earn certificates.", color: "#4DA771", lightColor: "#e8f5ee", icon: "ri-book-open-line" },
  { id: "research", title: "Research", tagline: "Digital E-Library", description: "Explore a curated collection of governance books, articles, white papers and research publications.", color: "#023137", lightColor: "#e6f0f2", icon: "ri-book-3-line" },
  { id: "explore", title: "Explore", tagline: "AI Research Assistant", description: "Chat with an AI assistant trained on governance resources. Ask questions, explore insights.", color: "#4DA771", lightColor: "#e8f5ee", icon: "ri-robot-2-line" },
  { id: "assess", title: "Assess", tagline: "Governance Assessment", description: "Evaluate governance frameworks, run diagnostic assessments and access improvement roadmaps.", color: "#023137", lightColor: "#e6f0f2", icon: "ri-clipboard-line" },
  { id: "analyse", title: "Analyse", tagline: "Analytics & Insights", description: "Deep-dive into governance data, visualize trends, benchmark and generate strategic reports.", color: "#4DA771", lightColor: "#e8f5ee", icon: "ri-bar-chart-2-line" },
];

const WelcomeGateway = ({ onNavigate, onAuthClick }) => {
  return (
    <div className="welcome">
      <div className="welcome-bg">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-grid" />
      </div>
      
      <header className="welcome-header">
        <div className="welcome-logo" onClick={() => onNavigate('welcome')}>
          <img src={LogoV2} alt="GRH Logo" style={{ height: '32px' }} />
        </div>
        <div className="welcome-header-actions">
          <Button variant="primary" size="sm" onClick={() => onAuthClick('login')}>Sign In / Sign Up</Button>
        </div>
      </header>

      <main className="welcome-hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Your Governance Intelligence Platform
        </div>
        <h1 className="hero-title">
          Everything you need for
          <span className="hero-title-accent"> Governance Excellence</span>
        </h1>
        <p className="hero-subtitle">
          One unified platform for learning, research, AI-powered insights, and governance analysis.
        </p>
      </main>

      <div className="welcome-cards">
        {SECTIONS_DATA.map((s, i) => (
          <button 
            key={s.id} 
            className="welcome-card animate-up" 
            style={{ animationDelay: `${i * 0.08}s` }} 
            onClick={() => onNavigate(s.id)}
          >
            <div className="welcome-card-inner">
              <div className="card-icon-wrap" style={{ background: s.lightColor }}>
                <i className={`${s.icon} card-icon`} style={{ color: s.color }}></i>
              </div>
              <div className="card-content">
                <div className="card-tag" style={{ color: s.color, background: s.lightColor }}>
                  {s.tagline}
                </div>
                <h2 className="card-title">{s.title}</h2>
                <p className="card-desc">{s.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <footer className="welcome-footer">
        © 2025 Governance Resource Hub. Empowering governance excellence.
      </footer>
    </div>
  );
};

export default WelcomeGateway;
