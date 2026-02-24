import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import './AssessPage.css';
import Button from '../../components/ui/Button';

// Mock Data for Radar Chart
const IRI_DATA = [
  { subject: 'Structural', A: 120, fullMark: 150 },
  { subject: 'Operational', A: 98, fullMark: 150 },
  { subject: 'Integrity', A: 86, fullMark: 150 },
  { subject: 'Financial', A: 99, fullMark: 150 },
  { subject: 'Digital', A: 85, fullMark: 150 },
  { subject: 'Leadership', A: 65, fullMark: 150 },
];

const AssessPage = () => {
  return (
    <div className="assess-v2">
      <section className="assess-hero-v2 section-padding">
        <div className="container animate-in hero-content-v2">
          <div className="apple-label">Institutional Diagnostic</div>
          <h1 className="hero-title">Excellence is <br /><span className="text-gradient">Measurable.</span></h1>
          <p className="apple-subtitle">Evidence-based governance assessments designed to transform public institutions and inspire global confidence through rigorous data-driven diagnostics.</p>
          <div className="assess-actions-v2">
            <Button size="lg">Start Free Assessment</Button>
            <Button variant="ghost" size="lg">View Case Studies ›</Button>
          </div>
        </div>
      </section>

      <section className="assess-grid-v2 container">
        <div className="apple-card larg-card subtle-shadow animate-in">
          <div className="iri-radar-wrap-v2">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={IRI_DATA}>
                <PolarGrid stroke="#eee" />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fill: '#666', fontWeight: 700}} />
                <Radar
                  name="Readiness"
                  dataKey="A"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card-content-v2">
            <span className="card-tag-v2">Governance Health</span>
            <h2 className="hero-title-v2">Institutional Readiness <br />Index (IRI)</h2>
            <p className="context-detail">Governance Health is a comprehensive metric that evaluates the maturity of public institutions across six critical dimensions. By analyzing structural integrity, operational efficiency, and digital adoption, we provide senior leadership with a clear view of their institutional capacity to deliver services and maintain public trust. </p>
            <p className="context-secondary">The IRI utilizes 120+ data points, benchmarked against institutions like the World Bank and Transparency International, to generate a diagnostic profile that highlights systemic strengths and hidden vulnerabilities. Our analysis spans across procurement transparency, legislative oversight efficacy, and the robustness of public financial management (PFM) systems.</p>
            
            <div className="iri-actions">
                <Button variant="outline" size="sm">Download Methodology</Button>
                <Button variant="ghost" size="sm">Explore Dimensions ›</Button>
            </div>
          </div>
        </div>

        <div className="apple-card-grid">
          <div className="apple-card small-card subtle-shadow animate-in">
            <div className="card-icon-wrap-apple">
               <i className="ri-shield-keyhole-line"></i>
            </div>
            <h3>Integrity Audit</h3>
            <p>Identifying institutional vulnerabilities and strengthening structural transparency loops.</p>
          </div>
          <div className="apple-card small-card subtle-shadow animate-in">
             <div className="card-icon-wrap-apple">
               <i className="ri-line-chart-line"></i>
            </div>
            <h3>PFM Maturity</h3>
            <p>Benchmarking public financial management against PEFA and international best practices.</p>
          </div>
          <div className="apple-card small-card subtle-shadow animate-in">
             <div className="card-icon-wrap-apple">
               <i className="ri-group-line"></i>
            </div>
            <h3>Stakeholder Feedback</h3>
            <p>Capturing critical perspectives from civil society and institutional partners.</p>
          </div>
          <div className="apple-card small-card subtle-shadow animate-in">
             <div className="card-icon-wrap-apple">
               <i className="ri-scales-line"></i>
            </div>
            <h3>Legislative Oversight</h3>
            <p>Evaluating the effectiveness of parliamentary committees and oversight bodies.</p>
          </div>
        </div>
      </section>

      <section className="assess-content-extra container section-padding">
        <div className="extra-grid">
            <div className="extra-item animate-in">
                <span className="apple-label">Standardization</span>
                <h3>Universal Frameworks</h3>
                <p>We align our diagnostic tools with internationally recognized governance frameworks including UNCAC and OECD guidelines.</p>
            </div>
            <div className="extra-item animate-in">
                <span className="apple-label">Output</span>
                <h3>Strategic Roadmaps</h3>
                <p>Every assessment concludes with a prioritized action plan and a transition roadmap for institutional excellence.</p>
            </div>
        </div>
      </section>

      <section className="assess-quote-v2 container">
        <div className="quote-box-v2 glass">
          <i className="ri-double-quotes-l quote-v2-icon"></i>
          <p>"Assessment is the first step toward institutional reform. GovHub provided the evidence we needed to transform our legislative oversight and strengthen PFM accountability."</p>
          <div className="quote-author-v2">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" alt="Beatrice" className="author-avatar-img" />
            <div>
                <strong>Hon. Beatrice Nkosi</strong>
                <span>Parliamentary Committee Chair</span>
            </div>
          </div>
        </div>
      </section>

      <section className="assess-footer-cta container section-padding">
        <div className="footer-cta-box-v2 animate-in alternate-gradient">
          <h2 className="apple-title-sm" style={{ color: 'white' }}>Institutional <br />Excellence Starts Here.</h2>
          <p>Connect with our expert team for a complimentary diagnostic introductory session.</p>
          <Button variant="accent" size="lg">Consult an Expert</Button>
        </div>
      </section>
    </div>
  );
};

export default AssessPage;
