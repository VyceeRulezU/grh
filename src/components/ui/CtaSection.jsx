import React from 'react';
import './CtaSection.css';

const CtaSection = ({ 
  eyebrow = "Get Started Today", 
  title = <>Ready to deepen your <br /><span className="green-text">Governance Expertise?</span></>,
  description = "Join thousands of government officials, civil society practitioners, and researchers already learning on the Hub. All courses are free and self-paced.",
  primaryActionLabel = "Start Learning Now",
  primaryActionOnClick = () => {},
  secondaryActionLabel = "Browse Courses",
  secondaryActionHref = "#courses-section",
  note = "Free access · No credit card required · Self-paced"
}) => {
  return (
    <section className="cta-section" aria-labelledby="cta-heading">
      <div className="cta-inner">
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 id="cta-heading">{title}</h2>
        <p className="cta-summary">{description}</p>
        <div className="cta-btn-row">
          <button className="special-button" onClick={primaryActionOnClick}>
            {primaryActionLabel}
            <span className="material-symbols-outlined">arrow_outward</span>
          </button>
          <a href={secondaryActionHref} className="btn-outline">
            {secondaryActionLabel}
          </a>
        </div>
        <p className="cta-note">{note}</p>
      </div>
    </section>
  );
};

export default CtaSection;
