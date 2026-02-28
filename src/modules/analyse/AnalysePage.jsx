import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { COUNTRIES, DIMENSIONS } from '../../data/legacyData';
import CtaSection from '../../components/ui/CtaSection';
import './AnalysePage.css';

const AnalysePage = () => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  // Format data for radar chart
  const radarData = DIMENSIONS.map(d => ({
    subject: d.title.split(' ')[0],
    A: selectedCountry.scores[d.id] || 0,
    fullMark: 100
  }));

  const overallScore = Math.round(
    Object.values(selectedCountry.scores).reduce((a, b) => a + b, 0) / DIMENSIONS.length
  );

  return (
    <div className="page-wrapper analyse-page">
      <div className="analyse-hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-inner-left">
              <div className="hero-chip">
                <div className="dot">
                  <img src="/assets/color-dots-[1.0].svg" alt="dot" />
                </div>
                <p className="chip-text">Institutional Analysis</p>
              </div>
              <h1 className="section-title text-white">Governance Analytics & <br /> <span className="green-text">Insights</span></h1>
              <p className="hero-subline">
                Comparative analysis of public institution performance across 6 governance dimensions.
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="container analyse-content">
        <div className="analyse-top">
          <div className="country-selector-box animate-up">
            <span className="box-label">Select Country to Analyze</span>
            <div className="country-pills">
              {COUNTRIES.map(c => (
                <button 
                  key={c.id} 
                  className={`country-pill ${selectedCountry.id === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCountry(c)}
                >
                  <span className="flag">{c.flag}</span>
                  <span className="name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="overall-score-card animate-up" style={{animationDelay: '0.1s'}}>
            <span className="box-label">Institutional Health Score</span>
            <div className="score-display">
              <div className="score-value">{overallScore}</div>
              <div className="score-meta">
                <span className="status">EXCELLENT</span>
                <span className="percentile">Top 15% globally</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analyse-main">
          <div className="chart-box animate-up" style={{animationDelay: '0.15s'}}>
            <div className="box-header">
              <h3>Governance Dimension Profile</h3>
              <p>Performance overview for {selectedCountry.name}</p>
            </div>
            <div className="radar-container">
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#eee" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fill: '#666', fontWeight: 700}} />
                  <Radar
                    name={selectedCountry.name}
                    dataKey="A"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dimensions-grid">
            {DIMENSIONS.map((dim, i) => (
              <div key={dim.id} className="dimension-card animate-up" style={{animationDelay: `${0.2 + i*0.05}s`}}>
                <div className="dim-icon" style={{background: dim.color + '15', color: dim.color}}>{dim.icon}</div>
                <div className="dim-info">
                  <h4>{dim.title}</h4>
                  <div className="dim-score-row">
                    <div className="dim-bar-bg">
                      <div className="dim-bar-fill" style={{width: `${selectedCountry.scores[dim.id]}%`, background: dim.color}} />
                    </div>
                    <span className="dim-score-val">{selectedCountry.scores[dim.id]}</span>
                  </div>
                  <p>{dim.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <CtaSection 
          eyebrow="Advanced Reports"
          title={<>Want a deeper <br /><span className="green-text">Institutional Diagnostic?</span></>}
          description="Generate a 40-page technical report with granular metric breakdowns and strategic roadmaps for institutional reform."
          primaryActionLabel="Download Full Report (PDF)"
          secondaryActionLabel="Consult Analyst"
        />
      </div>
    </div>
  );
};

export default AnalysePage;
