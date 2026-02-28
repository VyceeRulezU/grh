import React, { useState } from 'react';
import CtaSection from '../../components/ui/CtaSection';
import './AssessPage.css';

const AssessPage = ({ onNavigate }) => {
  const [step, setStep] = useState("start");

  return (
    <div className="page-wrapper assess-page">
      <div className="assess-hero">
        <div className="container">
          <div className="assess-hero-inner">
            <div className="hero-inner-left">
              <div className="hero-chip">
                <div className="dot">
                  <img src="/assets/color-dots-[1.0].svg" alt="dot" />
                </div>
                <p className="chip-text">Professional Certification</p>
              </div>
              <h1 className="assess-hero-title">Validate your <br/> <span className="green-text">Governance Expertise</span></h1>
              <p className="assess-hero-subline">
                Benchmark your institutional knowledge against international standards and earn verifiable certificates.
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="container assess-content">
        <div className="assess-grid">
          <div className="assess-card highlight animate-up">
            <div className="card-image-wrap">
              <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400" alt="Governance" />
            </div>
            <h3>Certified Governance Professional (CGP)</h3>
            <p>Our flagship certification for practitioners in public policy, oversight, and institutional leadership. Validated by the Global Governance Council.</p>
            <div className="card-features">
              <span>✓ 6 Advanced Modules</span>
              <span>✓ Proctored Exam</span>
              <span>✓ Lifetime Recognition</span>
            </div>
            <button className="special-button" onClick={() => onNavigate('learn')}>Continue Learning →</button>
          </div>

          <div className="assess-card animate-up" style={{animationDelay: '0.1s'}}>
            <div className="card-image-wrap">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400" alt="Analysis" />
            </div>
            <h3>Institutional Maturity Diagnostic</h3>
            <p>A comprehensive assessment for institutions to evaluate 6 key dimensions of governance health and PFM accountability.</p>
            <div className="card-features">
              <span>✓ 120+ Micro-indicators</span>
              <span>✓ Strategic Roadmap</span>
              <span>✓ Benchmarking Report</span>
            </div>
            <button className="special-button" onClick={() => onNavigate('analyse')}>Go to Analytics</button>
          </div>

          <div className="assess-card animate-up" style={{animationDelay: '0.2s'}}>
            <div className="card-image-wrap">
              <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400" alt="Integrity" />
            </div>
            <h3>Integrity & Anti-Corruption Audit</h3>
            <p>Specialized assessment focuses on identifying institutional vulnerabilities and strengthening transparency protocols.</p>
            <div className="card-features">
              <span>✓ Vulnerability Mapping</span>
              <span>✓ Policy Review</span>
              <span>✓ Actionable Insights</span>
            </div>
            <button className="special-button">Consult Expert</button>
          </div>
        </div>

        <div className="certification-pathway section-padding">
          <h2 className="section-title">Your Certification Pathway</h2>
          <div className="pathway-steps">
            <div className="pathway-step">
              <div className="step-num">01</div>
              <h4>Foundation</h4>
              <p>Complete 4 core governance modules</p>
            </div>
            <div className="step-connector" />
            <div className="pathway-step inactive">
              <div className="step-num">02</div>
              <h4>Evaluation</h4>
              <p>Take the CGP-1 Diagnostic Exam</p>
            </div>
            <div className="step-connector" />
            <div className="pathway-step inactive">
              <div className="step-num">03</div>
              <h4>Final Project</h4>
              <p>Validate expertise in a case study</p>
            </div>
            <div className="step-connector" />
            <div className="pathway-step inactive">
              <div className="step-num">04</div>
              <h4>Licensing</h4>
              <p>Receive verifiable blockchain certificate</p>
            </div>
          </div>
        </div>

      
      </div>

      {/* CTA Section */}
        <CtaSection 
          eyebrow="Get Certified"
          title={<>Ready to validate your <br /><span className="green-text">Governance Expertise?</span></>}
          description="Start your assessment journey today and join a global network of certified governance professionals."
          primaryActionLabel="Continue Learning"
          primaryActionOnClick={() => onNavigate('learn')}
          secondaryActionLabel="Speak with an Expert"
        />

    </div>
  );
};

export default AssessPage;
