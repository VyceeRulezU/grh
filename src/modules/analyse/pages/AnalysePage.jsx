import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell, Sector, Label
} from 'recharts';
import { 
  NIGERIA_POPULATION_DATA, 
  NIGERIA_REVENUE_EXPENDITURE_DATA, 
  GEOPOLITICAL_ZONES, 
  SECTOR_EXPENDITURE,
  NIGERIA_STATES_DATA
} from '../../../data/nigeriaData';
import EgyptMap from '../components/NigeriaMap'; // Keep original import name if used that way, but actually it was NigeriaMap
import NigeriaMap from '../components/NigeriaMap';
import CtaSection from '../../../shared/ui/CtaSection';
import PageHero from '../../../shared/ui/PageHero';
import BudgetTableModal from '../components/BudgetTableModal';
import ComparativeTableModal from '../components/ComparativeTableModal';
import { BUDGET_DATA } from '../../../data/budgetData';
import './AnalysePage.css';

// Import assets to fix broken paths
import grhIcon from '../../../assets/images/Logo/GRH-icon.png';
import iconMain from '../../../assets/images/Logo/Icon.png';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalysePage = ({ onNavigate }) => {
  const [activeZone, setActiveZone] = useState(0);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', data: [] });
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);

  const openModal = (type) => {
    setModalConfig({
      isOpen: true,
      type,
      data: BUDGET_DATA[type] || []
    });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const totalExpenditure = SECTOR_EXPENDITURE.reduce((acc, curr) => acc + curr.value, 0);

  React.useEffect(() => {
    // Generic cards reveal
    gsap.fromTo('.chart-card, .cta-card, .budget-card, .signup-bar',
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.analyse-main-content',
          start: 'top 85%'
        }
      }
    );
  }, []);

  return (
    <div className="page-wrapper analyse-page">

      <PageHero
        chip="Governance Data Analytics"
        title={<>Empowering Governance Through<br /><span className="green-text">Data-Driven Insights</span></>}
        subtitle="Explore Nigeria's fiscal landscape with precision. Our interactive database provides comprehensive state-level data, comparative analysis, and performance metrics."
        counters={[
          { value: '36', label: 'States Covered' },
          { value: '20+', label: 'Years of Data' },
          { value: '₦84T', label: 'Expenditure Tracked' },
        ]}
      />

      {/* ── MAP HERO SECTION ────────────────────────────────────────── */}
      <div className="analyse-hero-v2">
        <div className="container">
          <div className="hero-layout">
            <div className="hero-text animate-up">
              <div className="hero-chip">
                <div className="dot">
                  <img src={`${import.meta.env.BASE_URL}assets/color-dots-[1.0].svg`} alt="dot" />
                </div>
                <p className="chip-text">State Fiscal Analysis</p>
              </div>
              <h1 className="section-title">Nigerian State <br /><span className="green-text">Fiscal Database</span></h1>
              <p className="hero-desc">
                This is an open source database of the fiscal data of the 36 state governments of Nigeria.
              </p>
              <p className="hero-subtext">
                The data here is compiled from various official sources, including the National Bureau of Statistics (NBS) and state governments' budget documents.
              </p>
              <div className="hero-disclaimer">
                <span className="material-symbols-outlined">info</span>
                <p>All data reported here is subject to change as government budget data is often revised.</p>
              </div>
            </div>
            <div className="hero-map animate-up" style={{animationDelay: '0.1s'}}>
              <NigeriaMap data={NIGERIA_STATES_DATA} />
            </div>
          </div>
        </div>
      </div>

      <div className="container analyse-main-content">
        {/* ── POPULATION & REVENUE CHARTS ────────────────────────────── */}
        <div className="charts-main-row">
          <div className="chart-card animate-up" style={{animationDelay: '0.2s'}}>
            <div className="chart-header">
              <h3>Total Population for the 36 States</h3>
              <p>Values in Millions (2011 - 2018)</p>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={NIGERIA_POPULATION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="population" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="chart-source">Source: National Bureau of Statistics</p>
            </div>
          </div>

          <div className="chart-card animate-up" style={{animationDelay: '0.3s'}}>
            <div className="chart-header">
              <h3>Total Revenue and Expenditure</h3>
              <p>Values in Trillion Naira (2008 - 2018)</p>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={NIGERIA_REVENUE_EXPENDITURE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Total Revenue" />
                  <Line type="monotone" dataKey="expenditure" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Total Expenditure" />
                </LineChart>
              </ResponsiveContainer>
              <p className="chart-source">Source: Central Bank of Nigeria / NBS</p>
            </div>
          </div>
        </div>

        {/* ── GEOPOLITICAL ZONES ─────────────────────────────────────── */}
        <div className="zones-section animate-up" style={{animationDelay: '0.4s'}}>
          <div className="section-header">
            <h3>Share of Total Expenditure by Geopolitical Zones</h3>
            <p>Original Budget, 2024 Breakdown</p>
          </div>
          <div className="zones-grid">
            {GEOPOLITICAL_ZONES.map((zone, idx) => (
              <div key={idx} className="zone-chart-box">
                <h4>{zone.name}</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={zone.states}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name}) => name}
                    >
                      {zone.states.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTOR & COMPARATIVE ───────────────────────────────────── */}
        <div className="bottom-charts-row">
          <div className="chart-card animate-up" style={{animationDelay: '0.5s'}}>
            <div className="chart-header">
              <h3>Expenditure by Sector</h3>
              <p>National Average Allocation</p>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={SECTOR_EXPENDITURE}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {SECTOR_EXPENDITURE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle" 
                    wrapperStyle={{ paddingLeft: '20px' }}
                    content={({ payload }) => (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {payload.map((entry, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                            <span style={{ color: '#1e293b' }}>{entry.value}</span>
                            <span style={{ color: '#64748b', marginLeft: 'auto' }}>{entry.payload.value}%</span>
                          </div>
                        ))}
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>TOTAL</span>
                          <span style={{ fontWeight: 800, color: '#1e293b' }}>{totalExpenditure}%</span>
                        </div>
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="cta-card animate-up" style={{animationDelay: '0.6s'}}>
            <h3>Explore comparative data of states</h3>
            <p>Select multiple states to compare their fiscal health and performance metrics over time.</p>
            <button className="btn-secondary" onClick={() => setIsComparatorOpen(true)}>Open Comparator</button>
            <div className="cta-card-image">
              <img src={iconMain} alt="GRH Icon" />
            </div>
          </div>
        </div>

        {/* ── BUDGETS SECTION ────────────────────────────────────────── */}
        <div className="budgets-section">
          <div className="budget-card green animate-up" style={{animationDelay: '0.7s'}}>
            <div className="card-top">
              <h4>Original Budget</h4>
              <p>Government estimated revenue and economic projections over a period of local year.</p>
              <div className="budget-card-image">
              <img src={grhIcon} alt="GRH Icon" />
            </div>
            </div>
            <button className="white-pill-btn" onClick={() => openModal('original')}>View More</button>
          </div>
          <div className="budget-card orange animate-up" style={{animationDelay: '0.8s'}}>
            <div className="card-top">
              <h4>Actual</h4>
              <p>Government financial actuals and receipts over the latest period.</p>
              <div className="budget-card-image">
              <img src={grhIcon} alt="GRH Icon" />
            </div>
            </div>
            <button className="white-pill-btn" onClick={() => openModal('actual')}>View Details</button>
          </div>
          <div className="budget-card dark animate-up" style={{animationDelay: '0.9s'}}>
            <div className="card-top">
              <h4>Budget Performance Indicators</h4>
              <p>An evaluation tool for the performance of the government's budget.</p>
              <div className="budget-card-image">
              <img src={iconMain} alt="GRH Icon" />
            </div>
            </div>
            <button className="white-pill-btn" onClick={() => openModal('indicators')}>Details</button>
          </div>
        </div>

        <BudgetTableModal 
          isOpen={modalConfig.isOpen}
          onClose={closeModal}
          type={modalConfig.type}
          data={modalConfig.data}
        />

        <ComparativeTableModal 
          isOpen={isComparatorOpen}
          onClose={() => setIsComparatorOpen(false)}
        />

        {/* ── SIGNUP SECTION ─────────────────────────────────────────── */}
        <div className="signup-bar animate-up">
          <div className="signup-text">
            <h3>Sign up for updates</h3>
            <p>Receive updates on the government performance database.</p>
          </div>
          <div className="signup-form">
            <input type="email" placeholder="Email Address" />
            <button className="special-button">Subscribe</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        <CtaSection 
          eyebrow="Take Action"
          title={<>Ready to explore more<br /><span className="green-text">Governance Data?</span></>}
          description="Access detailed reports, comparative analytics, and state-level benchmarking to drive informed decision making."
          primaryActionLabel="View Research Library"
          primaryActionOnClick={() => onNavigate && onNavigate('research')}
          secondaryActionLabel="Take a Course"
          secondaryActionHref="#"
          note="Free access · No credit card required"
        />
      </div>

    </div>
  );
};

export default AnalysePage;
