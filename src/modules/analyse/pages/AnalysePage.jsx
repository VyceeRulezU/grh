import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell, Sector, Label, AreaChart, Area
} from 'recharts';
import { 
  NIGERIA_POPULATION_DATA, 
  NIGERIA_REVENUE_EXPENDITURE_DATA, 
  GEOPOLITICAL_ZONES, 
  SECTOR_EXPENDITURE,
  NIGERIA_STATES_DATA
} from '../../../data/nigeriaData';
import NigeriaMap from '../components/NigeriaMap';
import { Helmet } from 'react-helmet-async';
import CtaSection from '../../../shared/ui/CtaSection';
import PageHero from '../../../shared/ui/PageHero';
import BudgetTableModal from '../components/BudgetTableModal';
import ComparativeTableModal from '../components/ComparativeTableModal';
import { BUDGET_DATA } from '../../../data/budgetData';
import ModernDropdown from '../../../shared/ui/ModernDropdown';

// Import new PFM Consolidated Database and Modal
import { PFM_DATA, PFM_INTRO_TEXT } from '../../../data/pfmData';
import PfmTableModal from '../components/PfmTableModal';

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

  // New PFM states
  const [activeState, setActiveState] = useState('Kaduna');
  const [activeYear, setActiveYear] = useState('2022'); // 2022 is the latest year with fully audited actuals for all states
  const [isPfmModalOpen, setIsPfmModalOpen] = useState(false);
  const [pfmModalCategory, setPfmModalCategory] = useState('Total Cash Available');

  const openLegacyModal = (type) => {
    setModalConfig({
      isOpen: true,
      type,
      data: BUDGET_DATA[type] || []
    });
  };

  const closeLegacyModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const totalExpenditure = SECTOR_EXPENDITURE.reduce((acc, curr) => acc + curr.value, 0);

  // Available years based on selected state
  const availableYears = React.useMemo(() => {
    if (!PFM_DATA[activeState]) return [];
    return Object.keys(PFM_DATA[activeState]).sort((a, b) => b - a); // descending
  }, [activeState]);

  // Adjust year if active state doesn't support the currently selected year
  React.useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(activeYear)) {
      setActiveYear(availableYears[0]);
    }
  }, [activeState, availableYears, activeYear]);

  // Calculate sparkline data for a specific category
  const getSparklineData = (category) => {
    if (!PFM_DATA[activeState]) return [];
    return Object.entries(PFM_DATA[activeState])
      .map(([year, data]) => ({
        year,
        actual: data[category]?.actual || 0,
        original: data[category]?.original || 0
      }))
      .sort((a, b) => a.year - b.year);
  };

  // Helper to format large currency numbers beautifully
  const formatCompactCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val) || val === 0) return '₦0.00';
    const absVal = Math.abs(val);
    if (absVal >= 1e9) {
      return `₦ ${(val / 1e9).toFixed(1)}B`;
    }
    if (absVal >= 1e6) {
      return `₦ ${(val / 1e6).toFixed(1)}M`;
    }
    return `₦ ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  // Helper to calculate performance percentage
  const calculatePerformance = (actual, original) => {
    if (!original || original === 0) {
      return actual > 0 ? '100%' : '0%';
    }
    const percent = (actual / original) * 100;
    return `${percent.toFixed(0)}%`;
  };

  React.useEffect(() => {
    // Bento cards reveal animation
    gsap.fromTo('.bento-card, .pfm-control-bar',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.pfm-bento-section',
          start: 'top 85%'
        }
      }
    );
  }, []);

  const openPfmModal = (category) => {
    setPfmModalCategory(category);
    setIsPfmModalOpen(true);
  };

  return (
    <div className="page-wrapper analyse-page">
      <Helmet>
        <title>Institutional Performance & PFM Database | GRH</title>
        <meta name="description" content="Explore comprehensive fiscal data, regional expenditure benchmarks, and institutional performance metrics for the states of Nigeria." />
      </Helmet>

      <PageHero
        chip="PFM Database Analytics"
        title={<>Empowering Governance Through<br /><span className="green-text">Consolidated PFM Data</span></>}
        subtitle="Explore Nigeria's fiscal landscape with precision. Our interactive database provides comprehensive state-level budget data, actual receipts, expenditures and comparative analyses."
        counters={[
          { value: '5', label: 'Key Entities' },
          { value: '20+', label: 'Years of Data' },
          { value: '₦40T+', label: 'Budget Tracked' },
        ]}
      />

      {/* ── NEW PFM DATABASE BENTO SECTION ─────────────────────────── */}
      <div className="container pfm-bento-section">
        
        {/* Unified Control Center */}
        <div className="pfm-control-bar animate-up">
          <div className="bar-left">
            <span className="material-symbols-outlined control-icon">tune</span>
            <h3>PFM Analytics Controller</h3>
          </div>
          <div className="bar-right">
            <div className="state-pills">
              {['Kaduna', 'Kano', 'Jigawa', 'Yobe', 'Federal'].map(state => (
                <button
                  key={state}
                  className={`state-pill-btn ${activeState === state ? 'active' : ''}`}
                  onClick={() => setActiveState(state)}
                >
                  {state === "Federal" ? "Federal Gov" : state}
                </button>
              ))}
            </div>
            
            <ModernDropdown
              options={availableYears}
              value={activeYear}
              onChange={setActiveYear}
            />
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="pfm-bento-grid">
          
          {/* Card 1: Context/Intro (Spans 2 columns) */}
          <div className="bento-card bento-intro">
            <div className="card-top">
              <div className="card-badge">
                <span className="material-symbols-outlined font-icon">menu_book</span>
                <span>Database Context</span>
              </div>
              <h3 className="bento-title">PERL-ARC PFM Database</h3>
              <p className="bento-intro-text">{PFM_INTRO_TEXT}</p>
            </div>
            <div className="card-bottom">
              <div className="methodology-tags">
                <span>Administrative Classification</span>
                <span>Economic Classification</span>
                <span>Distortion Free</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Cash Available */}
          <div className="bento-card bento-green" onClick={() => openPfmModal("Total Cash Available")}>
            <div className="card-glass-accent"></div>
            <div className="card-top">
              <div className="card-badge color-green">
                <span className="material-symbols-outlined font-icon">payments</span>
                <span>Total Cash Available</span>
              </div>
              <div className="metrics-box">
                <div className="metric">
                  <span className="label">Original Budget ({activeYear})</span>
                  <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Total Cash Available"]?.original)}</span>
                </div>
                <div className="metric">
                  <span className="label">Actual Collected ({activeYear})</span>
                  <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Total Cash Available"]?.actual)}</span>
                </div>
              </div>
            </div>
            <div className="card-bottom">
              <div className="sparkline-title">
                <span>Historical Trend (2004 - 2024)</span>
                <span className="perf-tag-badge">
                  Perf: {calculatePerformance(
                    PFM_DATA[activeState]?.[activeYear]?.["Total Cash Available"]?.actual,
                    PFM_DATA[activeState]?.[activeYear]?.["Total Cash Available"]?.original
                  )}
                </span>
              </div>
              <div className="sparkline-container">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={getSparklineData("Total Cash Available")}>
                    <defs>
                      <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 3: Recurrent Expenditure */}
          <div className="bento-card bento-teal" onClick={() => openPfmModal("Recurrent Expenditure")}>
            <div className="card-glass-accent"></div>
            <div className="card-top">
              <div className="card-badge color-teal">
                <span className="material-symbols-outlined font-icon">trending_up</span>
                <span>Recurrent Expenditure</span>
              </div>
              <div className="metrics-box">
                <div className="metric">
                  <span className="label">Original Budget ({activeYear})</span>
                  <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Recurrent Expenditure"]?.original)}</span>
                </div>
                <div className="metric">
                  <span className="label">Actual Outlay ({activeYear})</span>
                  <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Recurrent Expenditure"]?.actual)}</span>
                </div>
              </div>
            </div>
            <div className="card-bottom">
              <div className="sparkline-title">
                <span>Historical Trend (2004 - 2024)</span>
                <span className="perf-tag-badge color-teal">
                  Perf: {calculatePerformance(
                    PFM_DATA[activeState]?.[activeYear]?.["Recurrent Expenditure"]?.actual,
                    PFM_DATA[activeState]?.[activeYear]?.["Recurrent Expenditure"]?.original
                  )}
                </span>
              </div>
              <div className="sparkline-container">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={getSparklineData("Recurrent Expenditure")}>
                    <defs>
                      <linearGradient id="colorRecurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="actual" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRecurrent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 4: Capital Expenditure (Spans 2 columns) */}
          <div className="bento-card bento-gold bento-span-2" onClick={() => openPfmModal("Capital Expenditure")}>
            <div className="card-glass-accent"></div>
            <div className="card-top">
              <div className="card-badge color-gold">
                <span className="material-symbols-outlined font-icon">construction</span>
                <span>Capital Expenditure</span>
              </div>
              <div className="metrics-row">
                <div className="metrics-box">
                  <div className="metric">
                    <span className="label">Original Budget ({activeYear})</span>
                    <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Capital Expenditure"]?.original)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Actual Capital Spend ({activeYear})</span>
                    <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Capital Expenditure"]?.actual)}</span>
                  </div>
                </div>
                <div className="quick-info-box">
                  <span className="material-symbols-outlined info-icon">info</span>
                  <p>Includes developmental project allocations and poverty-focused capital spend targets.</p>
                </div>
              </div>
            </div>
            <div className="card-bottom">
              <div className="sparkline-title">
                <span>Historical Trend (2004 - 2024)</span>
                <span className="perf-tag-badge color-gold">
                  Perf: {calculatePerformance(
                    PFM_DATA[activeState]?.[activeYear]?.["Capital Expenditure"]?.actual,
                    PFM_DATA[activeState]?.[activeYear]?.["Capital Expenditure"]?.original
                  )}
                </span>
              </div>
              <div className="sparkline-container">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={getSparklineData("Capital Expenditure")}>
                    <defs>
                      <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="actual" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorCapital)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 5: Transfers & Movements */}
          <div className="bento-card bento-indigo" onClick={() => openPfmModal("Transfers")}>
            <div className="card-glass-accent"></div>
            <div className="card-top">
              <div className="card-badge color-indigo">
                <span className="material-symbols-outlined font-icon">swap_horiz</span>
                <span>Transfers & Movements</span>
              </div>
              <div className="metrics-box">
                <div className="metric">
                  <span className="label">Original Budget ({activeYear})</span>
                  <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Transfers"]?.original)}</span>
                </div>
                <div className="metric">
                  <span className="label">Actual Transfers ({activeYear})</span>
                  <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Transfers"]?.actual)}</span>
                </div>
              </div>
            </div>
            <div className="card-bottom">
              <div className="sparkline-title">
                <span>Historical Trend (2004 - 2024)</span>
                <span className="perf-tag-badge color-indigo">
                  Perf: {calculatePerformance(
                    PFM_DATA[activeState]?.[activeYear]?.["Transfers"]?.actual,
                    PFM_DATA[activeState]?.[activeYear]?.["Transfers"]?.original
                  )}
                </span>
              </div>
              <div className="sparkline-container">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={getSparklineData("Transfers")}>
                    <defs>
                      <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorTransfers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 6: Total Expenditure Summary (Spans 2 columns) */}
          <div className="bento-card bento-slate bento-span-2" onClick={() => openPfmModal("Total Expenditure")}>
            <div className="card-glass-accent"></div>
            <div className="card-top">
              <div className="card-badge color-slate">
                <span className="material-symbols-outlined font-icon">analytics</span>
                <span>Total Expenditure Summary</span>
              </div>
              <div className="metrics-row">
                <div className="metrics-box">
                  <div className="metric">
                    <span className="label">Original Budget ({activeYear})</span>
                    <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Total Expenditure"]?.original)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Actual Outlay ({activeYear})</span>
                    <span className="val">{formatCompactCurrency(PFM_DATA[activeState]?.[activeYear]?.["Total Expenditure"]?.actual)}</span>
                  </div>
                </div>
                <div className="quick-info-box">
                  <span className="material-symbols-outlined info-icon">bar_chart</span>
                  <p>Aggregate sum of all Recurrent and Capital Expenditure channels of government.</p>
                </div>
              </div>
            </div>
            <div className="card-bottom">
              <div className="sparkline-title">
                <span>Historical Trend (2004 - 2024)</span>
                <span className="perf-tag-badge color-slate">
                  Perf: {calculatePerformance(
                    PFM_DATA[activeState]?.[activeYear]?.["Total Expenditure"]?.actual,
                    PFM_DATA[activeState]?.[activeYear]?.["Total Expenditure"]?.original
                  )}
                </span>
              </div>
              <div className="sparkline-container">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={getSparklineData("Total Expenditure")}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="actual" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── MAIN INTERACTIVE DETAILS MODAL ─────────────────────────── */}
      <PfmTableModal 
        isOpen={isPfmModalOpen}
        onClose={() => setIsPfmModalOpen(false)}
        initialCategory={pfmModalCategory}
        initialState={activeState}
        initialYear={activeYear}
      />

      {/* ── LEGACY DESIGN COMMENTED OUT IN ACCORDANCE WITH SPECIFICATIONS ── */}
      {/* 
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

        <div className="budgets-section">
          <div className="budget-card green animate-up" style={{animationDelay: '0.7s'}}>
            <div className="card-top">
              <h4>Original Budget</h4>
              <p>Government estimated revenue and economic projections over a period of local year.</p>
              <div className="budget-card-image">
              <img src={grhIcon} alt="GRH Icon" />
            </div>
            </div>
            <button className="white-pill-btn" onClick={() => openLegacyModal('original')}>View More</button>
          </div>
          <div className="budget-card orange animate-up" style={{animationDelay: '0.8s'}}>
            <div className="card-top">
              <h4>Actual</h4>
              <p>Government financial actuals and receipts over the latest period.</p>
              <div className="budget-card-image">
              <img src={grhIcon} alt="GRH Icon" />
            </div>
            </div>
            <button className="white-pill-btn" onClick={() => openLegacyModal('actual')}>View Details</button>
          </div>
          <div className="budget-card dark animate-up" style={{animationDelay: '0.9s'}}>
            <div className="card-top">
              <h4>Budget Performance Indicators</h4>
              <p>An evaluation tool for the performance of the government's budget.</p>
              <div className="budget-card-image">
              <img src={iconMain} alt="GRH Icon" />
            </div>
            </div>
            <button className="white-pill-btn" onClick={() => openLegacyModal('indicators')}>Details</button>
          </div>
        </div>

        <BudgetTableModal 
          isOpen={modalConfig.isOpen}
          onClose={closeLegacyModal}
          type={modalConfig.type}
          data={modalConfig.data}
        />

        <ComparativeTableModal 
          isOpen={isComparatorOpen}
          onClose={() => setIsComparatorOpen(false)}
        />

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
      */}

      <div className="container" style={{ paddingBottom: '4rem' }}>
        <CtaSection 
          eyebrow="Take Action"
          title={<>Ready to explore more<br /><span className="green-text">Governance Data?</span></>}
          description="Access detailed reports, comparative analytics, and state-level benchmarking to drive informed decision making."
          primaryActionLabel="View Research Library"
          primaryActionOnClick={() => onNavigate && onNavigate('research')}
          secondaryActionLabel="Take a Course"
          secondaryActionOnClick={() => onNavigate && onNavigate('learn-discovery')} 
          note="Free access · No credit card required"
        />
      </div>

      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        <span className="material-symbols-outlined">expand_less</span>
      </button>
    </div>
  );
};

export default AnalysePage;
