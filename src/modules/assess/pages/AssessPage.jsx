import React, { useState, useRef } from 'react';
import CtaSection from '../../../shared/ui/CtaSection';
import PageHero from '../../../shared/ui/PageHero';
import Tab from '../../../shared/ui/Tab';
import StatusModal from '../../../shared/ui/StatusModal';
import StateLoginModal from '../components/StateLoginModal';
import ResourceViewer from '../../research/components/ResourceViewer';
import { Helmet } from 'react-helmet-async';
import './AssessPage.css';
import assessMainImg from '../../../assets/images/Pictures/assess_main.png';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

// ─── Assessment Tabs ──────────────────────────────────
const ASSESSMENT_TABS = [
  { id: 'assessment', label: 'Take Self Assessment' },
  { id: 'resources', label: 'Resources' },
];

// ─── Cloudflare R2 Base URL ───────────────────────────
const R2_BASE = 'https://pub-18be25e422c14b14ac1da71403c739f3.r2.dev';

// ─── Assess Resources ─────────────────────────────────
const ASSESS_RESOURCES = [
  {
    id: 'perform-pms',
    title: 'PERFORM (PMS)',
    desc: 'Performance Management System framework for government institutions covering goal-setting, monitoring and improvement cycles.',
    file_url: `${R2_BASE}/assess/PERFORM%20(PMS).pdf`,
    type: 'PDF',
    category: 'Assessment Framework',
  },
  {
    id: 'perl-general-guide',
    title: 'PERL General Guide to Self-Assessments with Government Partners',
    desc: 'Comprehensive guide for government partners on the self-assessment process including Briefing, Retreat, and Validation steps.',
    file_url: `${R2_BASE}/assess/PERL%20General%20Guide%20to%20Self-Assessments%20with%20Government%20Partners%20(1).pdf`,
    type: 'PDF',
    category: 'General Guide',
  },
  {
    id: 'perl-governance-manual',
    title: 'PERL Governance Assessment Manual',
    desc: 'Full guidelines and indicator scoring frameworks for the PERL governance self-assessment and Public Sector Reform assessments.',
    file_url: `${R2_BASE}/assess/PERL%20Governance%20Assessment%20Manual.pdf`,
    type: 'PDF',
    category: 'Assessment Manual',
  },
  {
    id: 'pfm-raa-manual',
    title: 'PFM-RAA Framework Manual',
    desc: 'Step-by-step guide to conducting Public Financial Management Rapid Annual Assessments.',
    file_url: `${R2_BASE}/assess/PFM-RAA%20Framework%20Manual.pdf`,
    type: 'PDF',
    category: 'PFM Framework',
  },
  {
    id: 'regional-hubs-guide',
    title: 'Regional Hubs Government Assessments Guide',
    desc: 'Strategic assessment guide for regional governance hub structures and their effectiveness across partner states.',
    file_url: `${R2_BASE}/assess/Regional%20Hubs%20Government%20Assessments%20Guide%20(1).pdf`,
    type: 'PDF',
    category: 'Regional Hubs',
  },
];

// ─── Nigerian States ──────────────────────────────────
const STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"
];

// ─── Assessment Types ─────────────────────────────────
const ASSESSMENT_TYPES = [
  {
    id: 'psr',
    number: '01',
    title: 'PSR',
    fullTitle: 'Public Sector Reform',
    desc: 'Simplified version of the State Evaluation and Assessment Tool, aligned with PERL governance frameworks.',
    icon: 'account_balance',
    manual: 'PERL Governance Assessment Manual',
  },
  {
    id: 'pfm',
    number: '02',
    title: 'PFM RAA',
    fullTitle: 'Public Financial Management',
    desc: 'Rapid Annual Assessment of public financial management practices, updated from the SPARC PFM framework.',
    icon: 'payments',
    manual: 'PFM-RAA Framework Manual',
  },
  {
    id: 'hub',
    number: '03',
    title: 'Regional Hub Governance',
    fullTitle: 'Hub Governance Assessment',
    desc: 'Strategic assessment of regional governance hub structures and their effectiveness across partner states.',
    icon: 'hub',
    manual: 'Regional Hub Governance Manual',
  },
];

const AssessPage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('assessment');
  const [currentView, setCurrentView] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  // Modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [welcomeModal, setWelcomeModal] = useState({ open: false, state: '' });
  // Resources state
  const [resourceLayout, setResourceLayout] = useState('list'); // 'list' | 'grid'
  const [viewerResource, setViewerResource] = useState(null);

  const handleLoginSuccess = (stateName) => {
    setIsLoggedIn(true);
    setSelectedState(stateName);
    setShowLoginModal(false);
    setWelcomeModal({ open: true, state: stateName });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedState('');
  };

  // ─── Views ────────────────────────────────────────
  const renderOverview = () => (
    <>
      {/* ── ABOUT PERFORM ─────────────────────────────── */}
      <section className="ap-section ap-about">
        <div className="container">
          <div className="ap-about-grid">
            <div className="ap-about-text">
              <span className="ap-tag">About PERFORM</span>
              <h2 className="ap-section-title">A Framework for <span className="green-text">Governance Reform</span></h2>
              <p>
                The purpose of this self-assessment guide is to support the continuation and embedding of
                the self-assessment process for governance reform, ensuring necessary robustness whilst
                maintaining local ownership.
              </p>
              <p>
                A number of self-assessment processes are supported by the PERL partnership with ARC and
                government partners — ensuring local ownership of reform and an appropriate reform trajectory.
              </p>

              <div className="ap-core-list">
                {[
                  { icon: 'account_balance', label: 'Governance Assessments', desc: 'Partner state governments in Jigawa, Kaduna, Kano & Federal level' },
                  { icon: 'payments', label: 'PFM-RAA', desc: 'Public Financial Management Rapid Annual Assessments' },
                  { icon: 'location_city', label: 'LG Assessments', desc: 'Assessment of Local Governments and State-LG interface' },
                ].map((item, i) => (
                  <div key={i} className="ap-core-item">
                    <div className="ap-core-icon">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ap-about-visual">
              <div className="ap-visual-main">
                <img
                  src={assessMainImg}
                  alt="Nigerian governance professionals in a meeting"
                />
              </div>
              <div className="ap-visual-accent">
                {/* <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=400"
                  alt="Government team reviewing assessments"
                /> */}

                {/* <div className="ap-visual-stat">
                  <strong>36</strong>
                  <span>States</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GOVERNMENT PARTNERS ─────────────────────────── */}
      <section className="ap-section ap-gov-partners">
        <div className="ap-gov-partners-bg">
          <img
            src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=1400"
            alt="African government officials collaborating"
          />
          <div className="ap-gov-partners-overlay" />
        </div>

        <div className="container ap-gov-partners-inner">
          <div className="ap-gov-header">
            <span className="ap-tag light">Assessments</span>
            <h2 className="ap-section-title text-white">Assessment with <span className="green-text">Government Partners</span></h2>
            <p className="text-fade">Select a tab to explore assessment types or access resources.</p>

            <Tab
              tabs={ASSESSMENT_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="ap-tab-switcher"
            />
          </div>

          <div className="ap-tab-body">
            {activeTab === 'assessment' ? (
              <>
                {/* Assessment Carousel */}
                <div className="ap-carousel">
                  {ASSESSMENT_TYPES.map((a) => (
                    <div key={a.id} className="ap-carousel-card" onClick={() => setCurrentView(a.id)}>
                      <div className="ap-card-num">{a.number}</div>
                      <div className="ap-card-icon">
                        <span className="material-symbols-outlined">{a.icon}</span>
                      </div>
                      <h3>{a.title}</h3>
                      <p>{a.fullTitle}</p>
                      <span className="ap-card-desc">{a.desc}</span>
                      <button className="ap-card-cta">Explore →</button>
                    </div>
                  ))}
                </div>

                {/* State Login */}
                <div className="ap-state-login">
                  {!isLoggedIn ? (
                    <div className="ap-login-form">
                      <div className="ap-login-icon">
                        <span className="material-symbols-outlined">lock_open</span>
                      </div>
                      <h3>State Assessment Portal</h3>
                      <p>Login with your state credentials to view progress reports and take assessments.</p>
                      <button className="special-button" style={{ marginTop: '1.5rem' }} onClick={() => setShowLoginModal(true)}>
                        Login as State
                      </button>
                    </div>
                  ) : (
                    <div className="ap-welcome-state">
                      <div className="ap-welcome-header">
                        <div>
                          <span className="ap-welcome-greeting">Welcome,</span>
                          <h3 className="ap-welcome-name">{selectedState} State</h3>
                        </div>
                        <button className="ap-logout-btn" onClick={handleLogout}>
                          <span className="material-symbols-outlined">logout</span> Logout
                        </button>
                      </div>
                      <div className="ap-progress-section">
                        <h4>Assessment Progress Report</h4>
                        <div className="ap-progress-list">
                          {[
                            { label: 'PSR', percent: 65, color: '#4da771' },
                            { label: 'PFM RAA', percent: 20, color: '#3b82f6' },
                            { label: 'Regional Hub', percent: 0, color: '#f59e0b' },
                          ].map((p, i) => (
                            <div key={i} className="ap-progress-row">
                              <span className="ap-prog-label">{p.label}</span>
                              <div className="ap-prog-track">
                                <div className="ap-prog-fill" style={{ width: `${p.percent}%`, background: p.color }} />
                              </div>
                              <span className="ap-prog-pct">{p.percent}%</span>
                            </div>
                          ))}
                        </div>
                        <div className="ap-welcome-actions">
                          <button className="special-button" onClick={() => setCurrentView('form')}>Resume Assessment</button>
                          <button className="white-pill-btn">Download Report</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // ── RESOURCES TAB ──────────────────────────────────────
              <div className="ap-resources-section">
                {/* View Toggle */}
                <div className="ap-res-toolbar">
                  <p className="ap-res-count">{ASSESS_RESOURCES.length} documents</p>
                  <div className="ap-view-toggle">
                    <button
                      className={`ap-toggle-btn ${resourceLayout === 'list' ? 'active' : ''}`}
                      onClick={() => setResourceLayout('list')}
                      title="List view"
                      aria-label="List view"
                    >
                      <span className="material-symbols-outlined">view_list</span>
                    </button>
                    <button
                      className={`ap-toggle-btn ${resourceLayout === 'grid' ? 'active' : ''}`}
                      onClick={() => setResourceLayout('grid')}
                      title="Grid view"
                      aria-label="Grid view"
                    >
                      <span className="material-symbols-outlined">grid_view</span>
                    </button>
                  </div>
                </div>

                {/* Resources */}
                <div className={`ap-resources ${resourceLayout === 'grid' ? 'ap-resources--grid' : 'ap-resources--list'}`}>
                  {ASSESS_RESOURCES.map((r) => (
                    <div key={r.id} className="ap-resource-card">
                      <div className="ap-res-icon">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                      </div>
                      <div className="ap-res-info">
                        <span className="ap-res-category">{r.category}</span>
                        <h4>{r.title}</h4>
                        <p>{r.desc}</p>
                      </div>
                      <div className="ap-res-actions">
                        <button
                          className="ap-view-btn"
                          onClick={() => setViewerResource(r)}
                          aria-label={`Open ${r.title}`}
                        >
                          <span className="material-symbols-outlined">open_in_full</span>
                          Open
                        </button>
                        <a
                          className="ap-dl-btn"
                          href={r.file_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Download ${r.title}`}
                        >
                          <span className="material-symbols-outlined">download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────── */}
      <section className="ap-section ap-process">
        <div className="container">
          <div className="ap-process-header">
            <span className="ap-tag">How It Works</span>
            <h2 className="ap-section-title">Self-Assessment <span className="green-text">Process</span></h2>
          </div>
          <div className="ap-process-steps">
            {[
              {
                num: '01',
                title: 'Briefing',
                desc: 'Pre-retreat session covering the indicators to be scored, evidence collection, and overview of the process.',
                detail: 'Half-day session within the state led by the responsible agency.',
                icon: 'record_voice_over',
              },
              {
                num: '02',
                title: 'Self-Assessment Retreat',
                desc: 'Two or three-day retreat with senior officials for structured scoring and discussions of all indicators.',
                detail: 'Guided by reform areas, with a detailed schedule covering indicators and plenary reviews.',
                icon: 'groups',
              },
              {
                num: '03',
                title: 'Validation Meeting',
                desc: 'Half-day meeting to confirm scores, resolve contentious items, and agree on reform priorities.',
                detail: 'Select senior participants review the draft report and finalize priorities.',
                icon: 'fact_check',
              },
            ].map((step, i) => (
              <div key={i} className="ap-process-card">
                <div className="ap-proc-top">
                  <span className="ap-proc-num">{step.num}</span>
                  <div className="ap-proc-icon">
                    <span className="material-symbols-outlined">{step.icon}</span>
                  </div>
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <div className="ap-proc-detail">
                  <span className="material-symbols-outlined">info</span>
                  <span>{step.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const renderLanding = (id) => {
    const a = ASSESSMENT_TYPES.find(t => t.id === id);
    return (
      <div className="ap-landing container">
        <button className="ap-back-btn" onClick={() => setCurrentView('overview')}>
          <span className="material-symbols-outlined">arrow_back</span> Back to Overview
        </button>
        <div className="ap-landing-grid">
          <div className="ap-landing-text">
            <span className="ap-tag">{a.title}</span>
            <h1 className="ap-landing-title">{a.fullTitle} Assessment</h1>
            <p>{a.desc}</p>
            <p className="ap-landing-manual">Reference Manual: <strong>{a.manual}</strong></p>
            <div className="ap-landing-actions">
              <button className="special-button" onClick={() => setCurrentView('form')}>
                Take Assessment
              </button>
              <button className="white-pill-btn">View Manual</button>
            </div>
          </div>
          <div className="ap-landing-img">
            <img
              src="https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&q=80&w=800"
              alt={`${a.title} assessment`}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="ap-form-view container">
      <button className="ap-back-btn" onClick={() => setCurrentView('overview')}>
        <span className="material-symbols-outlined">arrow_back</span> Cancel
      </button>
      <div className="ap-form-card">
        <div className="ap-form-header">
          <span className="material-symbols-outlined">assignment</span>
          <div>
            <h2>Assessment Form</h2>
            <p>Complete each indicator with a score and supporting evidence.</p>
          </div>
        </div>
        <div className="ap-form-fields">
          {[
            'Strategic Planning & Direction',
            'Institutional Capacity & Resources',
            'Monitoring & Evaluation Systems',
          ].map((indicator, i) => (
            <div key={i} className="ap-form-group">
              <label>Indicator {i + 1}: {indicator}</label>
              <div className="ap-form-row">
                <select className="ap-select">
                  <option value="">Select Score</option>
                  <option>A — Achieved</option>
                  <option>B — In Progress</option>
                  <option>C — Not Started</option>
                </select>
                <textarea className="ap-textarea" placeholder="Describe the evidence for this score..." />
              </div>
            </div>
          ))}
        </div>
        <button className="special-button ap-submit-btn" onClick={() => {
          setCurrentView('overview');
        }}>
          Generate Report
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper assess-page">
      <Helmet>
        <title>Self-Assessment Toolkit | Institutional Reform | GRH</title>
        <meta name="description" content="Access the PERFORM self-assessment suite and PSR frameworks to evaluate and drive governance reform at the state level." />
      </Helmet>
      <PageHero
        chip="Institutional Assessment"
        title={<>Self-Assessment for <br /><span className="green-text">Governance Reform</span></>}
        subtitle="A robust framework supporting continuation and embedding of governance reform processes with government partners across Nigeria"
      />

      {/* ── STATE LOGIN MODAL ── */}
      <StateLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* ── WELCOME NOTIFICATION ── */}
      <StatusModal
        isOpen={welcomeModal.open}
        title={`Welcome, ${welcomeModal.state}!`}
        message={`You are now logged in as ${welcomeModal.state} State. You can view your progress and continue your assessments below.`}
        iconBg="#f0fdf4"
        iconColor="#4da771"
        onConfirm={() => setWelcomeModal({ open: false, state: '' })}
        onCancel={() => setWelcomeModal({ open: false, state: '' })}
        confirmLabel="View Assessments"
        cancelLabel="Close"
      />

      <div className="assess-main-content">
        {currentView === 'overview' && renderOverview()}
        {['psr', 'pfm', 'hub'].includes(currentView) && renderLanding(currentView)}
        {currentView === 'form' && renderForm()}
      </div>

      {currentView === 'overview' && (
        <div className="container" style={{ paddingBottom: '5rem' }}>
          <CtaSection
            eyebrow="Get Started"
            title={<>Ready to begin your <br /><span className="green-text">Institutional Assessment?</span></>}
            description="Access detailed manuals, scoring frameworks, and generate comprehensive reform reports today."
            primaryActionLabel="Login as State"
            primaryActionOnClick={() => {
              const el = document.querySelector('.ap-state-login');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            secondaryActionLabel="Take a Course"
            secondaryActionOnClick={() => onNavigate && onNavigate('learn-discovery')}
          />
        </div>
      )}

      {/* ── PDF RESOURCE VIEWER ── */}
      <ResourceViewer
        isOpen={!!viewerResource}
        onClose={() => setViewerResource(null)}
        resource={viewerResource}
      />

      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        <span className="material-symbols-outlined">expand_less</span>
      </button>
    </div>
  );
};

export default AssessPage;
