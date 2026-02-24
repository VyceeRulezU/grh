import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import './AnalysePage.css';
import Button from '../../components/ui/Button';

// Mock Data
const TREND_DATA = [
  { year: '2019', score: 65 },
  { year: '2020', score: 68 },
  { year: '2021', score: 62 },
  { year: '2022', score: 75 },
  { year: '2023', score: 82 },
  { year: '2024', score: 79 },
];

const SECTOR_DATA = [
  { name: 'Health', value: 74, color: '#4DA771' },
  { name: 'Educ', value: 82, color: '#023137' },
  { name: 'Infra', value: 58, color: '#4DA771' },
  { name: 'Fin', value: 91, color: '#023137' },
];

const AnalysePage = () => {
  return (
    <div className="analyse-v2">
      <section className="analyse-hero-v3">
        <div className="analyse-hero-bg">
          <div className="hero-blob hero-blob-1"></div>
          <div className="hero-blob hero-blob-2"></div>
          <div className="hero-grid-pattern"></div>
        </div>
        
        <div className="container hero-layout-v3 animate-in">
          <div className="hero-text-v3">
            <div className="apple-label">Institutional Intelligence</div>
            <h1 className="hero-title">Governance <br />Data, <span className="text-gradient">Redefined.</span></h1>
            <p className="hero-subtitle">Transforming complex socio-political indicators into strategic visual intelligence for high-impact decision making.</p>
            <div className="hero-actions-v3">
               <Button size="lg">Generate Insight Report</Button>
               <div className="hero-meta-v3">
                  <span><i className="ri-shield-check-line"></i> Verified Data</span>
                  <span><i className="ri-global-line"></i> 190+ Indicators</span>
               </div>
            </div>
          </div>
          
          <div className="hero-visual-v3 glass subtle-shadow">
             <div className="visual-chart-header">
                <span>Real-time WGI Stream</span>
                <i className="ri-pulse-line pulse"></i>
             </div>
             <div className="visual-chart-box">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4DA771" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4DA771" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="score" stroke="#4DA771" strokeWidth={3} fill="url(#heroGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </section>

      <section className="analyse-boards container">
        <div className="analyse-board-header">
          <h2 className="apple-title-sm">Intelligence Boards</h2>
          <Button variant="ghost">View All Sets ›</Button>
        </div>
        
        <div className="analyse-grid-v2">
          {/* Main Board */}
          <div className="apple-card analyse-card-lg subtle-shadow animate-in">
            <div className="analyse-card-content">
              <span className="card-tag-v2">Global Comparison</span>
              <h3>Worldwide Governance Indicators (WGI)</h3>
              <p>Compare governance performance across regions with 25-year trend analysis and granular regional breakdowns.</p>
              
              <div className="chart-container-v2">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4DA771" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4DA771" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="score" stroke="#4DA771" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="analyse-split-grid">
            <div className="apple-card analyse-card-sm subtle-shadow animate-in">
              <div className="analyse-card-content">
                <span className="card-tag-v2">Sectoral Efficiency</span>
                <h3>Health vs Finance</h3>
                <div className="mini-chart-v2">
                   <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={SECTOR_DATA}>
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {SECTOR_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                      <XAxis dataKey="name" hide />
                    </BarChart>
                   </ResponsiveContainer>
                </div>
                <p>Allocative efficiency and integrity in sector-specific procurement.</p>
              </div>
            </div>
            <div className="apple-card analyse-card-sm subtle-shadow animate-in">
              <div className="analyse-card-content">
                <span className="card-tag-v2">Transparency</span>
                <h3>Public Investment</h3>
                <p>Tracking transparency in large-scale infrastructure projects with real-time risk scoring.</p>
                <div className="risk-indicator">
                  <div className="risk-bar"><div className="risk-fill" style={{width: '72%'}}></div></div>
                  <span>High Performance (72%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="analyse-feature-v2 section-padding">
        <div className="container apple-feature-grid">
          <div className="feature-text-v2">
            <h2 className="apple-title-sm">Seamless Integration. <br />Infinite Possibilities.</h2>
            <p>Our analytics platform connects directly with your institutional data systems to provide real-time monitoring and predictive alerts.</p>
            <ul className="apple-list">
              <li><i className="ri-checkbox-circle-fill"></i> API-driven data ingestion</li>
              <li><i className="ri-checkbox-circle-fill"></i> Custom visualization builds</li>
              <li><i className="ri-checkbox-circle-fill"></i> Predictive risk modeling</li>
            </ul>
          </div>
          <div className="feature-visual-v2 glass subtle-shadow">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SECTOR_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {SECTOR_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </section>
      
      <section className="analyse-footer-v2 container">
        <div className="footer-cta-dark animate-in">
          <h2 className="apple-title-sm" style={{ color: 'white' }}>Intelligence <br />at Scale.</h2>
          <Button variant="accent" size="lg">Generate Strategic Report</Button>
        </div>
      </section>
    </div>
  );
};

export default AnalysePage;
